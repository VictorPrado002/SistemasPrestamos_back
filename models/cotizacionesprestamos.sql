CREATE DATABASE  IF NOT EXISTS `cotizacionprestamos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cotizacionprestamos`;
-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: cotizacionprestamos
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `banco`
--

DROP TABLE IF EXISTS `banco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banco` (
  `id_banco` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tasa_interes` float NOT NULL,
  `years` varchar(50) NOT NULL,
  `enganche` float NOT NULL,
  PRIMARY KEY (`id_banco`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banco`
--

LOCK TABLES `banco` WRITE;
/*!40000 ALTER TABLE `banco` DISABLE KEYS */;
INSERT INTO `banco` VALUES (1,'BBVA',13.6,'10,15,20',17.5),(2,'HSBC',12.8,'10,20',18.2),(3,'Infonavit',9,'10,15',9.4);
/*!40000 ALTER TABLE `banco` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cotizacion`
--

DROP TABLE IF EXISTS `cotizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion` (
  `id_cotizacion` int NOT NULL AUTO_INCREMENT,
  `monto_casa` float NOT NULL,
  `monto_credito` float NOT NULL,
  `mensualidad` float NOT NULL,
  `tipo_cotizacion` enum('Sueldo','Monto de Casa') NOT NULL,
  `monto_total` float NOT NULL,
  `sueldo_mensual` float DEFAULT NULL,
  `year` int NOT NULL,
  `id_banco` int DEFAULT NULL,
  `id_historial` int NOT NULL,
  PRIMARY KEY (`id_cotizacion`),
  KEY `id_banco` (`id_banco`),
  KEY `id_historial` (`id_historial`),
  CONSTRAINT `cotizacion_ibfk_1` FOREIGN KEY (`id_banco`) REFERENCES `banco` (`id_banco`) ON DELETE SET NULL,
  CONSTRAINT `cotizacion_ibfk_2` FOREIGN KEY (`id_historial`) REFERENCES `historial` (`id_historial`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizacion`
--

LOCK TABLES `cotizacion` WRITE;
/*!40000 ALTER TABLE `cotizacion` DISABLE KEYS */;
INSERT INTO `cotizacion` VALUES (5,234523,191840,2220.27,'Monto de Casa',532865,NULL,20,2,23),(6,5125620,4192760,48525.2,'Sueldo',11646000,121313,20,2,24),(7,34234,31016,392.9,'Monto de Casa',47147.7,NULL,10,3,25),(8,2000000,1650000,25223.6,'Monto de Casa',3026830,NULL,10,1,26),(9,594461,490431,6400,'Sueldo',1152000,16000,15,1,27),(10,3314360,2711140,31377.6,'Sueldo',7530620,78444,20,2,28),(11,23432,21229.4,215.32,'Monto de Casa',38758.1,NULL,15,3,29),(12,786,642.95,7.44,'Monto de Casa',1785.89,NULL,20,2,30),(13,391762,354936,3600,'Sueldo',648000,9000,15,3,31),(14,348528,315767,4000,'Sueldo',480000,10000,10,3,32),(15,2000000,1636000,24234.6,'Monto de Casa',2908160,NULL,10,2,33),(16,418234,378920,4800,'Sueldo',576000,12000,10,3,34),(17,2000020,1636020,18934.6,'Monto de Casa',4544290,NULL,20,2,35),(18,487940,442073,5600,'Sueldo',672000,14000,10,3,36);
/*!40000 ALTER TABLE `cotizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial`
--

DROP TABLE IF EXISTS `historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` date NOT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historial_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial`
--

LOCK TABLES `historial` WRITE;
/*!40000 ALTER TABLE `historial` DISABLE KEYS */;
INSERT INTO `historial` VALUES (1,'2024-11-08',2),(2,'2024-11-08',2),(3,'2024-11-08',2),(4,'2024-11-08',2),(5,'2024-11-08',2),(6,'2024-11-08',2),(7,'2024-11-08',2),(8,'2024-11-08',2),(9,'2024-11-08',2),(10,'2024-11-08',3),(11,'2024-11-08',3),(12,'2024-11-08',3),(13,'2024-11-08',3),(14,'2024-11-08',3),(15,'2024-11-08',3),(16,'2024-11-08',3),(21,'2024-11-08',3),(22,'2024-11-08',3),(23,'2024-11-08',3),(24,'2024-11-08',3),(25,'2024-11-08',3),(26,'2024-11-08',3),(27,'2024-11-08',2),(28,'2024-11-08',2),(29,'2024-11-08',2),(30,'2024-11-08',2),(31,'2024-11-08',2),(32,'2024-11-08',2),(33,'2024-11-09',3),(34,'2024-11-10',2),(35,'2024-11-10',2),(36,'2024-11-10',2);
/*!40000 ALTER TABLE `historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(50) NOT NULL,
  `apellido_paterno` varchar(50) NOT NULL,
  `apellido_materno` varchar(50) DEFAULT NULL,
  `rfc` varchar(13) NOT NULL,
  `edad` int NOT NULL,
  `estado_civil` varchar(20) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `fecha_alta` date NOT NULL,
  `rol` enum('Cliente','Administrador') NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (2,'Victor Hugo','Jim├⌐nez','Prado','JIPV02CE32',22,'Soltero','4498983982','victorJ@gmail.com','2024-11-07','Administrador','$2b$10$ZQY4SLCO924yWELIT8MtBuyfZMNJ8LRyISkrd0hMhtbuvc3fgRuJy'),(3,'Luis Angel','Alvizo','López','AILL010101QWR',20,'','4491234567','luisalvizo@gmail.com','2024-11-07','Cliente','$2b$10$lWZN9NPhos724d0bmwdwGOJp7uUIfJEtOfliBBNQ6k1ZFOaTLLAv6');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-10  1:01:58
