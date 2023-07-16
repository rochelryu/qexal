-- MySQL dump 10.13  Distrib 8.0.33, for macos13 (arm64)
--
-- Host: localhost    Database: qexal
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `control_code_entity`
--

DROP TABLE IF EXISTS `control_code_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `control_code_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `txHash` varchar(255) NOT NULL DEFAULT '',
  `type` varchar(255) NOT NULL DEFAULT '',
  `userid` int NOT NULL,
  `amount` double NOT NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_491c285df6ced03cf22ae95a11d` (`userid`),
  CONSTRAINT `FK_491c285df6ced03cf22ae95a11d` FOREIGN KEY (`userid`) REFERENCES `user_entity` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `control_code_entity`
--

LOCK TABLES `control_code_entity` WRITE;
/*!40000 ALTER TABLE `control_code_entity` DISABLE KEYS */;
INSERT INTO `control_code_entity` VALUES (1,'0x6b392d28e4197b0e8d16d0d244a18f3a37ca687c9d1414ccf410971011aabdd7','Success',1,5.1359,'2023-07-07 11:03:29.689674','2023-07-07 11:03:29.689674'),(2,'0x38181346d56d5aca6b54b0d7eee00cb2c5898d5a8ac6f72a10012d7d962eccc2','Success',1,5.1377,'2023-07-07 11:06:17.503632','2023-07-07 11:06:17.503632'),(3,'0xf02d29addb08f836063fdb49bda2b9274e9b7e5492a784e0519b6ac9fdd6935e','Success',1,5.1379,'2023-07-07 11:33:32.667711','2023-07-07 11:33:32.667711');
/*!40000 ALTER TABLE `control_code_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demande_entity`
--

DROP TABLE IF EXISTS `demande_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demande_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `etatid` int NOT NULL DEFAULT '2',
  `amount` double NOT NULL,
  `cumulPercentage` double NOT NULL DEFAULT '0',
  `percentageTotal` double NOT NULL,
  `commissionDay` double NOT NULL,
  `forfaitid` int NOT NULL,
  `accord` int NOT NULL DEFAULT '0',
  `userid` int NOT NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `expire_at` datetime DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `last_date_payement` datetime DEFAULT NULL,
  `ref` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_dea90c2c50e6bdc7257526556c5` (`forfaitid`),
  KEY `FK_b5e797cea93d62b905d4cb80197` (`userid`),
  KEY `FK_60072d53261c1fcab4bd73559ce` (`etatid`),
  CONSTRAINT `FK_60072d53261c1fcab4bd73559ce` FOREIGN KEY (`etatid`) REFERENCES `etat_entity` (`id`),
  CONSTRAINT `FK_b5e797cea93d62b905d4cb80197` FOREIGN KEY (`userid`) REFERENCES `user_entity` (`id`),
  CONSTRAINT `FK_dea90c2c50e6bdc7257526556c5` FOREIGN KEY (`forfaitid`) REFERENCES `forfait_entity` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demande_entity`
--

LOCK TABLES `demande_entity` WRITE;
/*!40000 ALTER TABLE `demande_entity` DISABLE KEYS */;
INSERT INTO `demande_entity` VALUES (1,2,5,0.30828,1.85,0.05138,4,0,1,'2023-07-07 11:33:32.676000','2023-08-12 11:33:33','2023-07-15 21:51:50.000000','2023-07-15 16:16:09','0xf02d29addb08f836063fdb49bda2b9274e9b7e5492a784e0519b6ac9fdd6935e');
/*!40000 ALTER TABLE `demande_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etat_entity`
--

DROP TABLE IF EXISTS `etat_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etat_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etat_entity`
--

LOCK TABLES `etat_entity` WRITE;
/*!40000 ALTER TABLE `etat_entity` DISABLE KEYS */;
INSERT INTO `etat_entity` VALUES (1,'En attente'),(2,'En cours'),(3,'Terminé');
/*!40000 ALTER TABLE `etat_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forfait_entity`
--

DROP TABLE IF EXISTS `forfait_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forfait_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `limit` int NOT NULL DEFAULT '30',
  `cover` varchar(255) NOT NULL,
  `addressCrypto` varchar(255) NOT NULL,
  `commissionTotal` double NOT NULL DEFAULT '1',
  `min` double NOT NULL DEFAULT '1',
  `max` double NOT NULL DEFAULT '1',
  `numberDayTotalVersement` int NOT NULL DEFAULT '1',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forfait_entity`
--

LOCK TABLES `forfait_entity` WRITE;
/*!40000 ALTER TABLE `forfait_entity` DISABLE KEYS */;
INSERT INTO `forfait_entity` VALUES (1,30,'bertone.png','bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',4,900,1600,90,1,'2023-06-15 17:31:30.959656','2023-06-15 17:31:30.959656'),(2,30,'koffetech.png','bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',2.55,400,899,50,1,'2023-06-15 18:38:18.791119','2023-06-15 18:38:18.791119'),(3,30,'dmc.png','bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',2,135,399,40,1,'2023-06-15 18:39:28.060021','2023-06-15 18:39:28.060021'),(4,30,'fitness.png','bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',1.85,5,134,36,1,'2023-06-15 18:41:00.912733','2023-07-06 17:09:09.182819');
/*!40000 ALTER TABLE `forfait_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie_entity`
--

DROP TABLE IF EXISTS `movie_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) NOT NULL,
  `cover` varchar(255) NOT NULL,
  `linkId` varchar(255) NOT NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie_entity`
--

LOCK TABLES `movie_entity` WRITE;
/*!40000 ALTER TABLE `movie_entity` DISABLE KEYS */;
INSERT INTO `movie_entity` VALUES (1,'Djamo, essayez le zéro frais','L\'appli pour mieux gérer votre argent. Ouvrez un compte gratuit maintenant en un clic.','djamo_ci.jpeg','JHpJU7FEMpI','2023-06-16 10:12:33.942224','2023-06-16 10:12:33.942224'),(2,'Nike','Just Do It','nike.jpeg','PZIqV7wNyyU','2023-06-16 13:40:33.023508','2023-06-16 13:40:33.023508'),(3,'Glovo','On vous livre plus que des repas','glovo_ci.jpeg','RSw3sGPAFQA','2023-06-16 13:47:19.574886','2023-06-16 13:47:19.574886'),(4,'Solibra','Société de Limonaderies et de Brasseries d\'Afrique - Certifié ISO 9001 version 2008 depuis 2005.','solibra_ci.jpeg','njt1Liv0h-s','2023-06-16 13:51:18.290341','2023-06-16 13:51:18.290341'),(5,'Shouz CI','Actualité, E-commerce Évènementiel & Covoiturage','shouz_ci.jpeg','i9HhFSQXX1A','2023-06-16 13:54:03.335432','2023-06-16 13:54:03.335432'),(6,'Jumia CI','On a tous les vrais wé. Mode, electroménager, télévisions, smartphones et plus encore. Avec Jumia, redonnez vie à vos rêves à prix kdo. Commande sur l\'APP chap.','jumia_ci.jpeg','G2JvQGRYOOo','2023-06-16 14:01:25.280172','2023-06-16 14:01:25.280172'),(7,'Wonder Dynamics AI','An AI tool that automatically animates, lights and composes CG characters into a live-action scene','wonderstudio.jpeg','nEHCBPGo-5M','2023-07-05 13:19:21.775948','2023-07-05 13:19:21.775948');
/*!40000 ALTER TABLE `movie_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_entity`
--

DROP TABLE IF EXISTS `notification_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(250) NOT NULL,
  `userid` int NOT NULL,
  `type` int NOT NULL,
  `isOpen` tinyint NOT NULL DEFAULT '1',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_395487ccdeaf0c1cdbfd24b3b45` (`userid`),
  CONSTRAINT `FK_395487ccdeaf0c1cdbfd24b3b45` FOREIGN KEY (`userid`) REFERENCES `user_entity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_entity`
--

LOCK TABLES `notification_entity` WRITE;
/*!40000 ALTER TABLE `notification_entity` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_entity`
--

DROP TABLE IF EXISTS `role_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_entity`
--

LOCK TABLES `role_entity` WRITE;
/*!40000 ALTER TABLE `role_entity` DISABLE KEYS */;
INSERT INTO `role_entity` VALUES (1,'client','2023-06-15 17:32:06.087808'),(2,'viewer','2023-06-15 17:32:22.315033'),(3,'admin','2023-06-15 17:32:39.117955');
/*!40000 ALTER TABLE `role_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schoolarship_entity`
--

DROP TABLE IF EXISTS `schoolarship_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schoolarship_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `subtitle` varchar(255) NOT NULL,
  `amount` double NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `expire_at` datetime DEFAULT NULL,
  `cover` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schoolarship_entity`
--

LOCK TABLES `schoolarship_entity` WRITE;
/*!40000 ALTER TABLE `schoolarship_entity` DISABLE KEYS */;
INSERT INTO `schoolarship_entity` VALUES (1,'Nante, France','  ',3500,1,'2023-06-20 14:47:24.286204','2023-06-20 14:50:40.679489','2023-08-31 00:00:00','audencia.jpg'),(2,'Istanbul, Turquie','   ',1600,1,'2023-06-20 14:48:28.574670','2023-06-20 14:50:06.254814','2023-09-28 00:00:00','kadir.jpg'),(3,'Plymouth, England','   ',1500,1,'2023-06-20 14:52:05.340121','2023-06-20 14:52:05.340121','2023-09-28 00:00:00','plymouth.jpg');
/*!40000 ALTER TABLE `schoolarship_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serial_user_entity`
--

DROP TABLE IF EXISTS `serial_user_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serial_user_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid_fraude` int NOT NULL,
  `userid_victime` int NOT NULL,
  `ref` varchar(255) NOT NULL DEFAULT '',
  `isDone` tinyint NOT NULL DEFAULT '0',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_76a46cd9f27e2665c5426993327` (`userid_fraude`),
  KEY `FK_87321a09af0c32be25da26a7e50` (`userid_victime`),
  CONSTRAINT `FK_76a46cd9f27e2665c5426993327` FOREIGN KEY (`userid_fraude`) REFERENCES `user_entity` (`id`),
  CONSTRAINT `FK_87321a09af0c32be25da26a7e50` FOREIGN KEY (`userid_victime`) REFERENCES `user_entity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serial_user_entity`
--

LOCK TABLES `serial_user_entity` WRITE;
/*!40000 ALTER TABLE `serial_user_entity` DISABLE KEYS */;
/*!40000 ALTER TABLE `serial_user_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_entity`
--

DROP TABLE IF EXISTS `user_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL DEFAULT '',
  `addressCrypto` varchar(255) NOT NULL DEFAULT '',
  `addressSelfCrypto` varchar(255) NOT NULL DEFAULT '',
  `numberClient` varchar(50) NOT NULL,
  `prefix` varchar(50) NOT NULL,
  `country` varchar(255) NOT NULL,
  `alpha2code` varchar(50) NOT NULL,
  `region` varchar(50) NOT NULL,
  `subregion` varchar(50) NOT NULL,
  `flag` varchar(50) NOT NULL DEFAULT '',
  `language` varchar(50) NOT NULL,
  `iso639_1` varchar(255) NOT NULL DEFAULT '',
  `currencies` varchar(50) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `motif` varchar(255) NOT NULL DEFAULT '',
  `recovery` varchar(25) NOT NULL,
  `roleid` int NOT NULL DEFAULT '1',
  `soldeGain` double NOT NULL DEFAULT '0',
  `soldeInvestissement` double NOT NULL DEFAULT '0',
  `parrainid` int NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `isWelcome` tinyint NOT NULL DEFAULT '1',
  `inscription` int NOT NULL DEFAULT '0',
  `retraitInWait` int NOT NULL DEFAULT '0',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `validEntryInSysteme` datetime DEFAULT NULL,
  `dateRetry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_fe1722eeef85af4d0e06df3376e` (`roleid`),
  CONSTRAINT `FK_fe1722eeef85af4d0e06df3376e` FOREIGN KEY (`roleid`) REFERENCES `role_entity` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_entity`
--

LOCK TABLES `user_entity` WRITE;
/*!40000 ALTER TABLE `user_entity` DISABLE KEYS */;
INSERT INTO `user_entity` VALUES (1,'Core Irie','','','','0564250219','+225','Côte d\'Ivoire','CI','Africa','Western Africa','','French','fr','XOF','$2b$08$TXxvh4wM5XBBJ.nFOzlX5.8PXoLkP2pZVSjOxrBQP/8AZ9FJmYEZq','core.irie@gmail.com','','ÙDuE6YYN',1,1.5414,0,3,1,1,8,0,'2023-06-15 18:36:11.394352','2023-07-15 22:05:15.055000',NULL,NULL),(2,'dieudonne ore','','','','0757155119','+39','Italy','IT','Europe','Southern Europe','','Italian','it','EUR','$2b$08$0UpR8k8hVkkfk3vXa50.2em6bIbFqAf.bZuDxWc8cIfEJyIUX5bTa','dore772@gmail.com','','QÔÜoÀNuz',1,0,0,3,1,1,0,0,'2023-06-16 14:31:38.118120','2023-06-16 14:31:38.118120',NULL,NULL),(4,'Zezeto','','0x1880868d5617bA08975803EE1EA6d7e0D1BE8450','','0102030304','+237','Cameroon','CM','Africa','Middle Africa','','English','en','XAF','$2b$08$9pCm1Lrz/1y4edK3EsQqnubpvEJErFubCUOCLQ285lnzJFm0XiGeq','infos@itiir.com','','64Ä2Ù27N',1,0,0,1,1,1,0,0,'2023-07-04 13:51:55.003583','2023-07-04 13:51:55.003583',NULL,NULL);
/*!40000 ALTER TABLE `user_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_movie_entity`
--

DROP TABLE IF EXISTS `user_movie_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_movie_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `movieid` int NOT NULL,
  `userid` int NOT NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_3fd11e874bf68e1fc75dde72fd3` (`movieid`),
  KEY `FK_342b2933a01a13a056f6383aa03` (`userid`),
  CONSTRAINT `FK_342b2933a01a13a056f6383aa03` FOREIGN KEY (`userid`) REFERENCES `user_entity` (`id`),
  CONSTRAINT `FK_3fd11e874bf68e1fc75dde72fd3` FOREIGN KEY (`movieid`) REFERENCES `movie_entity` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_movie_entity`
--

LOCK TABLES `user_movie_entity` WRITE;
/*!40000 ALTER TABLE `user_movie_entity` DISABLE KEYS */;
INSERT INTO `user_movie_entity` VALUES (1,5,1,'2023-07-04 19:10:35.731699','2023-07-04 19:10:35.731699'),(2,1,1,'2023-07-05 09:05:30.219342','2023-07-05 09:05:30.219342'),(3,2,1,'2023-07-05 09:07:05.318428','2023-07-05 09:07:05.318428'),(4,3,1,'2023-07-05 09:15:53.321459','2023-07-05 09:15:53.321459'),(5,4,1,'2023-07-05 14:14:36.222707','2023-07-05 14:14:36.222707');
/*!40000 ALTER TABLE `user_movie_entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdraw_entity`
--

DROP TABLE IF EXISTS `withdraw_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdraw_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ref` varchar(255) NOT NULL DEFAULT '',
  `amount` double NOT NULL,
  `userid` int NOT NULL,
  `etatid` int NOT NULL,
  `addressDestinate` varchar(255) NOT NULL DEFAULT '',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_0fe27caea326bb2eb75b2e480e8` (`etatid`),
  KEY `FK_4f1aaf13a68f38ab8da2b0c0447` (`userid`),
  CONSTRAINT `FK_0fe27caea326bb2eb75b2e480e8` FOREIGN KEY (`etatid`) REFERENCES `etat_entity` (`id`),
  CONSTRAINT `FK_4f1aaf13a68f38ab8da2b0c0447` FOREIGN KEY (`userid`) REFERENCES `user_entity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdraw_entity`
--

LOCK TABLES `withdraw_entity` WRITE;
/*!40000 ALTER TABLE `withdraw_entity` DISABLE KEYS */;
/*!40000 ALTER TABLE `withdraw_entity` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-07-16 13:52:12
