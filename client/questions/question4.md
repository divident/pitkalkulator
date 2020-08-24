---
id: 4
title: 'Co ze splitami akcji?'
---
Jeżeli zakupione akcje uległy podziałowi pomiędzy kupnem a sprzedażą, kalkulator zwróci informację o brakujących akcjach, 
pomimo dodania wszystkich raportów. Należy wtedy użyć formularza "Dodaj transakcje", a następnie dodać brakującą ilość akcji w cenie 0.
Wtedy jeżeli mieliśmy 10 akcji o wartości 20 USD każda, nastąpił split 1:2 otrzymujemy 20 akcji o wartości 10 USD każda. 
Dodanie 10 akcji o wartości 0 USD, spowoduje (10 * 20 + 10 * 0) / 20 = 10 USD (średnia cena akcji)
