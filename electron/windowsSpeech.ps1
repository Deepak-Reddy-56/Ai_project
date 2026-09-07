$ErrorActionPreference = 'Stop'

try {
    Add-Type -AssemblyName System.Speech

    $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
    $recognizer.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
    $recognizer.SetInputToDefaultAudioDevice()

    $recognizer.add_SpeechHypothesized({
        param($sender, $event)
        $text = [string]$event.Result.Text
        if ($text) {
            [Console]::WriteLine((ConvertTo-Json @{ type = 'hypothesis'; text = $text } -Compress))
        }
    })

    $recognizer.add_SpeechRecognized({
        param($sender, $event)
        $text = [string]$event.Result.Text
        $confidence = [double]$event.Result.Confidence
        if ($text) {
            [Console]::WriteLine((ConvertTo-Json @{ type = 'recognized'; text = $text; confidence = $confidence } -Compress))
        }
    })

    $recognizer.add_RecognizeCompleted({
        param($sender, $event)
        if ($event.Error) {
            [Console]::WriteLine((ConvertTo-Json @{ type = 'error'; message = $event.Error.Message } -Compress))
        } else {
            [Console]::WriteLine((ConvertTo-Json @{ type = 'end' } -Compress))
        }
    })

    [Console]::WriteLine((ConvertTo-Json @{ type = 'ready'; engine = 'Windows Speech Recognition' } -Compress))
    [Console]::Out.Flush()

    $recognizer.RecognizeAsync([System.Speech.Recognition.RecognizeMode]::Multiple)

    while ($true) {
        Start-Sleep -Milliseconds 250
    }
}
catch {
    [Console]::WriteLine((ConvertTo-Json @{ type = 'error'; message = $_.Exception.Message } -Compress))
    exit 1
}
finally {
    if ($recognizer) {
        try { $recognizer.RecognizeAsyncCancel() } catch { }
        try { $recognizer.Dispose() } catch { }
    }
}
