export default function Step({ text, stepNumber }) {
  return (
    <div>
        <h3>Krok {stepNumber}</h3>
        <div>{text}</div>
    </div>
      
  )
}