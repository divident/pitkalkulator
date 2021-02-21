import { useEffect, useState } from "react";


import "react-datepicker/dist/react-datepicker.css";

const cookiesStyle = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100vw',
    display: 'flex',
    columnGap: '10px',
    padding: '5px',
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    borderTop: '1px solid #ccc8d1'
};

export default function Cookies() {
    const [accepted, setAccepted] = useState(false);
    useEffect(() => {
        const cookiesState = localStorage.getItem('cookies') ? true : false;
        setAccepted(cookiesState)
    }, [])


    return (
        <>
            { accepted ? <></> :
                <div style={cookiesStyle}>
                    <div>Ta strona używa ciasteczek, w celu poprawy doświdczenia korzystania z serwisu</div>
                    <button onClick={() => {localStorage.setItem('cookies', 'yes'); setAccepted(true)}}>Zgoda</button>
                </div>
            }
        </>

    )
}