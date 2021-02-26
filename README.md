# Ticketing
Microservices study project with NodeJs, NextJs, Docker & Kubernetes based on Stephen Grider course.

Features:
1. Users can list a ticket for an event for sale
2. Other users can purchase this ticket
3. Any user can list tickets for sale and purchase tickets
4. When a user attempts to purchase a ticket, the ticket is locked for 15 minutes. The user has 15 minutes to enter their payment info.
5. While locked, no other users can purchase the ticket. After 15 minutes, the ticket should be unlocked. Should not display locked tickets
6. Ticket prices can be edited if they are not locked
