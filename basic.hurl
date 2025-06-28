GET http://localhost:3000/
GET http://localhost:3000/
GET http://localhost:3000/
GET http://localhost:3000/
GET http://localhost:3000/

GET http://localhost:3000/login/
GET http://localhost:3000/login/
GET http://localhost:3000/login/
GET http://localhost:3000/login/
GET http://localhost:3000/login/
GET http://localhost:3000/login/

POST http://localhost:3000/
[Query]
order: newest
count: "'"


PUT http://localhost:3000/
[Query]
order: --
count: 100



PUT http://localhost:3000/
[Form]
order: --
count: 100


PUT http://localhost:3000/
[Cookies]
order: --
count: 100


POST http://localhost:3000/
{
    "id": "INSERT",
    "name": "Frieda",
    "picture": "images/scottish-terrier.jpeg",
    "age": "--",
    "breed": "Scottish Terrier",
    "location": "Lisco, Alabama"
}



