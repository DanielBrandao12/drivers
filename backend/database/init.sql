
CREATE DATABASE IF NOT EXISTS db_rides CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE db_rides;


CREATE TABLE IF NOT EXISTS drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  m_name VARCHAR(255) NOT NULL,
  m_description TEXT NOT NULL,
  vehicle VARCHAR(255) NOT NULL,
  tax_km DECIMAL(10,2) NOT NULL,
  km_min INT NOT NULL
);


INSERT INTO drivers (m_name, m_description, vehicle, tax_km, km_min) VALUES
('Homer Simpson', 'Olá! Sou o Homer, seu motorista camarada! Relaxe e aproveite o passeio, com direito a rosquinhas e boas risadas (e talvez alguns desvios).', 'Plymouth Valiant 1973 rosa e enferrujado', 2.50, 1),
('Dominic Toretto', 'Ei, aqui é o Dom. Pode entrar, vou te levar com segurança e rapidez ao seu destino. Só não mexa no rádio, a playlist é sagrada.', 'Dodge Charger R/T 1970 modificado', 5.00, 5),
('James Bond', 'Boa noite, sou James Bond. À seu dispor para um passeio suave e discreto. Aperte o cinto e aproveite a viagem.', 'Aston Martin DB5 clássico', 10.00, 10);


CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rating INT NOT NULL,
  r_comment TEXT DEFAULT NULL,
  driver_id INT NOT NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);


INSERT INTO reviews (rating, r_comment, driver_id) VALUES
(2, 'Motorista simpático, mas errou o caminho 3 vezes. O carro cheira a donuts.', 1),
(4, 'Que viagem incrível! O carro é um show à parte e o motorista, apesar de ter uma cara de poucos amigos, foi super gente boa. Recomendo!', 2),
(5, 'Serviço impecável! O motorista é a própria definição de classe e o carro é simplesmente magnífico. Uma experiência digna de um agente secreto.', 3);


CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  u_name VARCHAR(255) NOT NULL
);


INSERT INTO users (u_name) VALUES
('Daniel');


CREATE TABLE IF NOT EXISTS rides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  distance DECIMAL(10,2) NOT NULL,
  duration VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  driver_id INT NOT NULL,
  r_value DECIMAL(10,2) NOT NULL,
  r_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);



SELECT * FROM drivers;
