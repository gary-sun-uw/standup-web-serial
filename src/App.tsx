import { useCallback, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SerialMessage, useSerial } from './SerialProvider'

const States =  {
  sit: 'sitting',
  stand: 'standing',
  unknown: '???'
}

function App() {
  const [count, setCount] = useState(0)
  const {portState, connect, disconnect, subscribe} = useSerial();
  const [state, setState] = useState(States.unknown);
  const [interval, setInterval] = useState<number>(5);
  const [time, setTime] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const callback = useCallback(({ value, timestamp }: SerialMessage) => {
    const cleaned = value.replace('\n', '').replace('\r', '');
    console.log(cleaned);
    if(cleaned.startsWith("t:")){
      const n = Number(cleaned.slice(2));
      if(n > time){
        setTime(n);
        state != States.sit && setState(States.sit);
      }
    }

    switch(cleaned){
      case 'i':
      case 'y':
        setState(States.sit);
        break;
      case 'x':
        setState(States.stand);
        break;
      case '5':
      case '10':
      case '20':
      case '40':
        setInterval(Number(value));
        break;
    }
  }, []);

  useEffect(() => {
    subscribe(callback);
  }, []);

  useEffect(() => {
    if(state == States.stand){
      const newTotal = total + time;
      setTotal(newTotal);
      setTime(0);
    }
  }, [state]);


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
          <span className='bold-text'>{state}</span>
        </div>
        <div className='card'>
          <span className='header-text'>{'you have been sitting for '}</span>
          <span className='bold-text'>{time+'s'}</span>
        </div>
        <div className='card'>
          <span className='header-text'>{'total time spent sitting '}</span>
          <span className='bold-text'>{total+'s'}</span>
        </div>
      </div>
      </div>
    </>
  )
}

export default App
