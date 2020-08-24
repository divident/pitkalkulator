
export function getSortedStepsData() {
    const stepsData = [
        {
            id: 1,
            title: 'Krok 1',
            content: 'Otwórz zakładkę z giełdą, a następnie wybierz zaznaczony przycisk',
            img: 'step_1.jpg'
        },
        {
            id: 2,
            title: 'Krok 2',
            content: 'Wybierz opcje "Statements", skąd będziesz mógł pobrać potrzebne raporty',
            img: 'step_2.jpg'
        },
        {
            id: 3,
            title: 'Krok 3',
            content: 'W tym momencie powinnienieś widzieć listę rozliczeń \
                  w poszczególnych latach. Aby dokonać wyliczenia pit \
                  musisz pobrać raporty za wszystkie 12 miesięcy.',
            warning: 'UWAGA: Dodatkow jeśli np. sprzedałeś w 2020 roku akcje kupione w 2019, \
                  musisz dołączć raport zakupu z 2019 do wysyłanych plików. Jeśli tego nie \
                  zrobisz, otrzymasz komunikat o brakujących akcjach.',
            img: 'step_3.jpg'
        },
        {
            id: 4,
            title: 'Krok 4',
            content: 'Pobrane pliki wyślij do wyliczenia PIT. Zaznacz wszystkie pliki jakie \
                  chcesz wysłać, korzystając z kombinacji klawiszy CTRL + LPM. Po wszystkim \
                  powinnienieś zobaczyć ekran podobny do Demo',
            img: 'step_4.jpg'
        },
    ]

    return stepsData;
}