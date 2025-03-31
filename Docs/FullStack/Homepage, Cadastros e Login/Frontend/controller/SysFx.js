export function getUserId(num) {
  
  if (num === 0) {
    return localStorage.getItem("idConsultor");
    
  } else if (num === 1) {
    return localStorage.getItem("idCliente");
  }

  return null;
}