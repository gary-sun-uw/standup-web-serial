import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { SerialMessage, useSerial } from './SerialProvider'

const States =  {
  sit: 'sitting',
  stand: 'standing',
  unknown: '???'
}

const stateClassInitial = 'bold-text';

function App() {
  const {portState, connect, disconnect, subscribe} = useSerial();
  const [state, setState] = useState(States.unknown);
  const [time, setTime] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [stateClass, setStateClass] = useState<string>(stateClassInitial);
  const [notify, setNotify] = useState<boolean>(false);

  const callback = useCallback(({ value }: SerialMessage) => {
    const cleaned = value.replace('\n', '').replace('\r', '');
    console.log(cleaned);
    if(cleaned.startsWith("t:")){
      const n = Number(cleaned.slice(2));
      if(n > time){
        setTime(n);
        state != States.sit && setState(States.sit);
        notify && setNotify(false);
      }
    }

    if(cleaned.startsWith("T:")){
      const n = Number(cleaned.slice(2));
      if(n > time){
        setTime(n);
        state != States.sit && setState(States.sit);
        !notify && setNotify(true);
      }
    }

    if(cleaned.includes('x')){
      setState(States.stand);
      return;
    }

    if(cleaned.includes('y')){
      setState(States.sit);
      return;
    }
  }, []);

  useEffect(() => {
    subscribe(callback);
  }, []);

  useEffect(() => {
    if(state == States.stand){
      setTotal(total + time);
      setTime(0);
      setNotify(false);
    }

    setStateClass(v => v + ' blink');

    setTimeout(() => {
      setStateClass(stateClassInitial);
    }, 1000);

  }, [state]);

  const getFormattedTime = (seconds: number): string => {
    if(seconds < 60){
      return seconds + 's';
    }

    if(seconds < 3600){
      const min = Math.floor(seconds/60);
      const sec = seconds - min*60;
      return min + 'm ' + sec + 's';
    }

    const hour = Math.floor(seconds/3600);
    const rem1 = seconds - hour*3600;
    const min = Math.floor(rem1/60);
    const sec = rem1 - min*60;

    return hour + "h " + min + 'm ' + sec + 's';
  }

  return (
    <>
    <div className='main-container'>
      <div className='container'>
        <div className="card">
            <button type='button' onClick={() => connect()}>
              connect
            </button>
            <button type='button' onClick={() => disconnect()}>
              disconnect
            </button>
        </div>
        <div className='card'>
          <span className='header-text'>serial connection: </span>
          <span className='bold-text'>{portState}</span>
        </div>
      </div>
      <div className='container'>
        <div className='card'>
          <span className='header-text'>{'your are'}</span>
          <span className={stateClass}>{state}</span>
        </div>
        <div className='card'>
          <span className='header-text'>{'you have been sitting for '}</span>
          <span className={notify ? 'bold-text-notify' : 'bold-text'}>{getFormattedTime(time)}</span>
        </div>
        <div className='card'>
          <span className='header-text'>{'total time spent sitting '}</span>
          <span className='bold-text'>{getFormattedTime(total)}</span>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
