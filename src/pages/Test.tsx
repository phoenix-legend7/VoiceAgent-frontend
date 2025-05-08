import axios from "axios";
import { useCallback, useRef } from "react";

const wsUrl = 'wss://s-usc1b-nss-2113.firebaseio.com/.ws?v=5&p=1:32624304791:web:8d6e433cd4b94cb0d73fd2&ns=millis-df3a9-default-rtdb'

const TestComponent = () => {
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => console.log("QR WS connected");
    ws.onmessage = evt => {
      try {
        const data = evt.data
        console.log(evt)
        console.log(data)
      } catch (err) {
        console.error("QR WS parse error", err);
      }
    };
    ws.onerror = err => {
      console.error("QR WS error", err);
    };
    ws.onclose = () => {
      console.log("QR WS closed");
    }
    wsRef.current = ws;
  }, []);

  const handleRequest = () => {
    axios.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyD2DVyYtK-XEoP1xh69fDII-KWMQXSLAy4',
      {
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNmOWEwNTBkYzRhZTgyOGMyODcxYzMyNTYzYzk5ZDUwMjc3ODRiZTUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiVGhvbWFzIFNjaGFsY2giLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSzlKLVJPTndYLTVQYTgzbklTdkRqdzdWYVJuakl4T01MYlhHSS05NENRU3NHcDFRPXM5Ni1jIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL21pbGxpcy1kZjNhOSIsImF1ZCI6Im1pbGxpcy1kZjNhOSIsImF1dGhfdGltZSI6MTc0NTgyNDc0MywidXNlcl9pZCI6Ing0WDljdHEwdlZhS0dMNm5XRU4zZkZER09vcDEiLCJzdWIiOiJ4NFg5Y3RxMHZWYUtHTDZuV0VOM2ZGREdPb3AxIiwiaWF0IjoxNzQ1ODkwNzgzLCJleHAiOjE3NDU4OTQzODMsImVtYWlsIjoiaGVsbG9AZWx5c2lhcGFydG5lcnMuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDk4NTU4MDU5NTg2NjkzNzI1NTYiXSwiZW1haWwiOlsiaGVsbG9AZWx5c2lhcGFydG5lcnMuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.KMjHZ_i5Pm0ToSZXn7oZi8nb-c-ikC17qHtDhdloHKP25qniye6ukRSBG-figGDNr-FUV154UkZhHsTK_tDOKmPrXI8SbywpX62y485HiGRlbFVFpUYl4voWNnv5YMLAoWWXgnlMO19SDGQIzvVp9oDUCY9QNGz0Nj0iZdVqfh42zqDU-pq3UyAjuJ6_OSB1cRzxoyRwgJ-7acVTibGV36qlkf6pa4YALKW1xtYpHm1LegFsd6W3bywZr_qWJVwaKof2yYfjaCf49DVM7NFwyiNCwxhnJl0f8Wlttc4eKjbzC914wiifvhvsaH69-765_Pyc40oqDz-ZiDHPCnlLlQ"
      }
    )
  }

  return (
    <div>
      <button onClick={connectWebSocket}>Start</button>
      <div><button onClick={handleRequest}>Start1</button></div>
    </div>
  )
}

export default TestComponent
