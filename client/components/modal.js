import { useState } from "react";
import DatePicker from "react-datepicker";
import styles from './modal.module.css'
import { API_URL } from '../constants';

import "react-datepicker/dist/react-datepicker.css";

export default function Modal({ request_id, symbols, visibleUpdated }) {
  const currencies = ['USD']

  const [settleDate, setSettleDate] = useState(new Date());
  const [symbol, setSymbol] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const [error, setError] = useState("");

  const sendActivity = (url) => {
    setError('');
    const bodyData = {
      price,
      quantity,
      currency,
      symbol,
      settle_date: settleDate
    }
    fetch(url, {
      method: 'POST', body: JSON.stringify(bodyData), headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 201) {
          return res.json()
        } else {
          try {
            res.json().then(data =>
              setError(data?.error || 'Nieznany błąd. Spróbuj ponownie')
            ).catch(
              setError('Nieznany błąd. Spróbuj ponownie')
            )
          }
          catch (e) {
            setError('Nieznany błąd. Spróbuj ponownie')
          }
          return null;
        }
      })
      .then(data => {
        if (data) {
          visibleUpdated()
        }
      })
      .catch((error) => setError(`${error}`))
  }


  return (
    <div className={styles.modal}>
      <div className={styles.textWarning}>{error}</div>
      <div className={styles.modalInput}>
        <div>Spółka</div>
        <select value={symbol} onChange={e => setSymbol(e.target.value)}>
          <option value="" selected disabled hidden>Wybierz spółkę</option>
          {[...new Set(symbols)].sort().map((s, i) =>
            <option key={i} value={s}>
              {s}
            </option>)}
        </select>
      </div>
      <div className={styles.modalInput}>
        <div>Data transakcji</div>
        <DatePicker dateFormat="yyyy-MM-dd" selected={settleDate} onChange={date => setSettleDate(date)} />
      </div>
      <div className={styles.modalInput}>
        <div>Waluta</div>
        <select value={currency} onChange={e => setCurrency(e.target.value)}>
          {currencies.map((s, i) =>
            <option key={i} value={s}>
              {s}
            </option>)}
        </select>
      </div>
      <div className={styles.modalInput}>
        <div>Ilość</div>
        <input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)}></input>
      </div>
      <div className={styles.modalInput}>
        <div>Cena</div>
        <input type="number" step="any" value={price} onChange={e => setPrice(e.target.value)}></input>
      </div>
      <div>
        <button className={styles.modalButton}
          onClick={e => sendActivity(`${API_URL}activity/${request_id}`)}>Wyślij</button>
        <button onClick={e => visibleUpdated()}>Anuluj</button>
      </div>
    </div>
  )
}