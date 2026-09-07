$ErrorActionPreference = 'Stop'

function Emit($payload) {
    [Console]::WriteLine(($payload | ConvertTo-Json -Compress))
    [Console]::Out.Flush()
}

$recognizer = $null

try {
    Add-Type -AssemblyName System.Speech

    # Use the shared Windows desktop speech recognizer instead of creating an
    # isolated SpeechRecognitionEngine. The shared recognizer uses the same
    # Windows Speech Recognition service and input configuration that desktop
    # speech uses.
    $recognizer = New-Object System.Speech.Recognition.SpeechRecognizer

    $installed = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers()
    $recognizerInfo = @($installed | ForEach-Object {
        @{ id = $_.Id; name = $_.Name; culture = $_.Culture.Name }
    })

    Emit @{
        type = 'ready'
        engine = 'Windows Shared Speech Recognition'
        recognizers = $recognizerInfo
        enabled = [bool]$recognizer.Enabled
        state = [string]$recognizer.State
    }

    $dictation = New-Object System.Speech.Recognition.DictationGrammar
    $dictation.Name = 'CodeCompanion Dictation'
    $recognizer.LoadGrammar($dictation)

    $recognizer.add_SpeechDetected({
        param($sender, $event)
        Emit @{ type = 'speech-detected' }
    })

    $recognizer.add_SpeechHypothesized({
        param($sender, $event)
        $text = [string]$event.Result.Text
        if ($text) {
            Emit @{ type = 'hypothesis'; text = $text }
        }
    })

    $recognizer.add_SpeechRecognized({
        param($sender, $event)
        $text = [string]$event.Result.Text
        $confidence = [double]$event.Result.Confidence
        if ($text) {
            Emit @{ type = 'recognized'; text = $text; confidence = $confidence }
        }
    })

    $recognizer.add_SpeechRecognitionRejected({
        param($sender, $event)
        $text = [string]$event.Result.Text
        Emit @{ type = 'rejected'; text = $text; confidence = [double]$event.Result.Confidence }
    })

    $recognizer.add_AudioLevelUpdated({
        param($sender, $event)
        Emit @{ type = 'audio-level'; level = [int]$event.AudioLevel }
    })

    $recognizer.add_AudioSignalProblemOccurred({
        param($sender, $event)
        Emit @{
            type = 'audio-problem'
            problem = [string]$event.AudioSignalProblem
        }
    })

    $recognizer.add_AudioStateChanged({
        param($sender, $event)
        Emit @{
            type = 'audio-state'
            state = [string]$event.AudioState
        }
    })

    $recognizer.add_StateChanged({
        param($sender, $event)
        Emit @{
            type = 'state'
            state = [string]$event.RecognizerState
        }
    })

    # The shared recognizer controls Windows desktop speech recognition and its
    # default configured input device, so explicitly enable it before listening.
    $recognizer.Enabled = $true

    Emit @{ type = 'listening'; state = [string]$recognizer.State }

    while ($true) {
        Start-Sleep -Milliseconds 250
    }
}
catch {
    Emit @{
        type = 'error'
        message = $_.Exception.Message
        detail = $_.Exception.ToString()
    }
    exit 1
}
finally {
    if ($recognizer) {
        try { $recognizer.Dispose() } catch { }
    }
}
