import React, {useState, useEffect, useRef} from 'react';
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";

const Index = () => {
  // 音声認識インスタンス
  const recognizerRef = useRef();

  // 音声認識
  const [detecting, setDetecting] = useState(false); // 検出ステータス
  const [finalText, setFinalText] = useState(''); // 確定された文章
  const [transcript, setTranscript] = useState('ボタンを押して検知開始'); // 認識中の文章

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("お使いのブラウザには未対応です");
      return;
    }
    
    // NOTE: 将来的にwebkit prefixが取れる可能性があるため
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognizerRef.current = new SpeechRecognition();
    recognizerRef.current.lang = 'ja-JP';
    recognizerRef.current.interimResults = true;
    recognizerRef.current.continuous = true;
    recognizerRef.current.onstart = () => {
      setDetecting(true);
    };
    recognizerRef.current.onend = () => {
      if (detecting) {
        recognizerRef.current.start();
      };
    };

    recognizerRef.current.onresult = event => {
      [...event.results].slice(event.resultIndex).forEach(result => {
        const transcript = result[0].transcript;
        setTranscript(transcript);
        if (result.isFinal) {
          // 音声認識が完了して文章が確定
          setFinalText(prevState => {
            if (prevState != '') {
              return prevState + '\n' + transcript;
            }
            else{
              return transcript;
            };
          });
          // 文章確定したら候補を削除
          setTranscript('');
        };
      });
    };
  });

  function downloadTextFile() {
    const element = document.createElement("a");
    const file = new Blob([finalText], { "type" : "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "speechLog.txt"
    element.click();
  };

  return(
    <div>
      <Container>
        <Box fontSize={25}>
          <p>
            <div style={{whiteSpace: "pre-line" }}>
              {finalText}
            </div>
          </p>
        </Box>
        <Box m={2}>
          <Grid container alignItems="center" justify="center">
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => {
                  {detecting ? setDetecting(false) : recognizerRef.current.start()};
                }}
              >
                {detecting ? "検知中..." : "検知開始"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => {
                  downloadTextFile();
                }}
              >
               テキストとして保存
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  )
}

export default Index
