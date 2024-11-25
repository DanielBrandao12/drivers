import axios from "axios"



const api = axios.create({
    baseURL: "http://localhost:8080",
   
    withCredentials: true, // Permite que os cookies sejam enviados e recebidos
    headers: {
        "Content-Type": "application/json", // Definir Content-Type como JSON por padrão
       
      },

});


export default api;