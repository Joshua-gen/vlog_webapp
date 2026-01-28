-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 28, 2026 at 04:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vlog_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `text` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `likes` int(11) DEFAULT 0,
  `liked_by` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `text`, `parent_id`, `created_at`, `likes`, `liked_by`) VALUES
(1, 3, 3, 'asdsa', NULL, '2026-01-27 14:17:54', 0, NULL),
(2, 9, 10, 'dsadasddsadas', NULL, '2026-01-28 02:03:25', 1, '[\"10\"]'),
(3, 9, 10, 'dsad', 2, '2026-01-28 02:03:30', 0, NULL),
(4, 9, 10, 'dasdsad', 2, '2026-01-28 02:03:49', 0, NULL),
(5, 9, 10, 'dsadasdasd', 2, '2026-01-28 02:03:54', 0, NULL),
(6, 9, 10, 'dsadas', NULL, '2026-01-28 02:08:15', 1, '[\"10\"]'),
(7, 9, 10, 'dasdas', 6, '2026-01-28 02:08:19', 0, NULL),
(8, 9, 10, 'dasdas', 2, '2026-01-28 02:10:04', 0, NULL),
(9, 9, 10, 'dsadsa', 2, '2026-01-28 02:12:03', 0, NULL),
(10, 9, 10, 'dasdadasdas', 2, '2026-01-28 02:13:36', 1, '[\"10\"]'),
(11, 8, 10, 'dsadsa', NULL, '2026-01-28 02:16:24', 0, NULL),
(12, 8, 10, 'dsada', 11, '2026-01-28 02:16:28', 0, NULL),
(13, 9, 10, 'dsada', 7, '2026-01-28 02:22:57', 0, NULL),
(14, 9, 12, 'nbbj', NULL, '2026-01-28 02:36:22', 0, NULL),
(15, 9, 12, 'jnjnjnk', 10, '2026-01-28 02:36:34', 0, NULL),
(16, 9, 12, 'kkm', 8, '2026-01-28 02:36:41', 0, NULL),
(17, 9, 10, 'dasdas', NULL, '2026-01-28 02:43:35', 0, NULL),
(18, 9, 10, 'dasdas', NULL, '2026-01-28 02:43:36', 0, NULL),
(19, 9, 10, 'dasdas', NULL, '2026-01-28 02:43:37', 0, NULL),
(20, 9, 10, 'dsadas', NULL, '2026-01-28 02:43:38', 0, NULL),
(21, 9, 10, 'bsdsnbdns', 6, '2026-01-28 02:53:22', 0, NULL),
(22, 9, 12, 'asmdnasmndsa', 2, '2026-01-28 02:53:41', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`files`)),
  `likes` int(11) DEFAULT 0,
  `liked_by` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`liked_by`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `title`, `created_at`, `files`, `likes`, `liked_by`) VALUES
(1, 2, 'dsadasd', '2026-01-27 09:16:16', NULL, 0, '[]'),
(2, 2, 'dsad', '2026-01-27 09:16:23', NULL, 0, '[]'),
(3, 3, 'dsad', '2026-01-27 14:11:42', NULL, 0, '[]'),
(4, 3, 'dsadasdsa', '2026-01-27 14:42:05', '[\"/uploads/image-1769524925765-16059181.jpg\",\"/uploads/image-1769524925768-502315962.png\",\"/uploads/image-1769524925775-228432387.jpg\",\"/uploads/image-1769524925782-815843751.jpg\",\"/uploads/image-1769524925783-764354844.png\",\"/uploads/image-1769524925786-534379912.jpg\"]', 0, '[]'),
(5, 3, 'dsadasdad', '2026-01-27 15:06:38', '[\"/uploads/file-1769526398360-721653917.jpg\",\"/uploads/file-1769526398360-909626716.png\",\"/uploads/file-1769526398365-495038174.png\",\"/uploads/file-1769526398380-533792152.png\",\"/uploads/file-1769526398384-179420812.png\"]', 0, '[]'),
(6, 3, 'dasdasd', '2026-01-27 15:07:48', '[\"/uploads/file-1769526467698-8918842.mp4\"]', 0, '[]'),
(7, 3, 'dasdad', '2026-01-27 15:22:25', '[\"/uploads/file-1769527345849-100181899.mp4\"]', 0, '[]'),
(8, 3, '', '2026-01-27 15:22:35', '[\"/uploads/file-1769527355405-198995503.mp4\"]', 2, '[\"3\",\"10\"]'),
(9, 3, '', '2026-01-27 15:24:42', '[\"/uploads/file-1769527482739-152031190.jpg\",\"/uploads/file-1769527482740-641025864.png\",\"/uploads/file-1769527482742-353353363.jpg\",\"/uploads/file-1769527482747-934886464.jpg\",\"/uploads/file-1769527482748-505293155.mp4\"]', 3, '[\"3\",\"10\",\"12\"]'),
(10, 10, 'asdas', '2026-01-28 00:45:40', '[\"/uploads/file-1769561140101-826526038.mp4\"]', 0, '[]');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `bio`, `image`, `name`) VALUES
(1, 'joshua', '123456', NULL, NULL, NULL),
(2, 'kiwkiwdsadadasda', '$2b$10$GxfzMXhvgjcN570BoQhgX.t92B.os2s1zNW2kOx87MjfwfyJPt3VK', 'dasdasddsadasdasdasd', '/uploads/image-1769512770623-478623382.png', NULL),
(3, 'marjorie9@gmail.com', '$2b$10$TLuIxwXDVvEqtjigl40j6uD4lporDnqEjBJJrkgyLAwggZmBz0V9O', 'sadasd', '/uploads/image-1769524059819-151444277.jpg', 'marjorie'),
(4, 'kiw22', '$2b$10$6OVMhyjAfJ9R3bbpMGNpBu/5ASSkpgs3//EZJli9.qm6DXOPwq3W.', 'dasdasd', '/uploads/image-1769516442017-53593117.jpg', 'wakkdka'),
(5, 'marjo', '$2b$10$XtvaUhnCAQWrfQuQe91rvO6gqbMHp6WrH2/.PY/DuZi5gHsM3kzTq', NULL, NULL, 'dasdas'),
(6, NULL, '$2b$10$nyUTqcuH563xjIPpS99xtuMoBNDWpq4UkUZKUVRsvWYzPSWeFVE4S', NULL, NULL, 'dasdas'),
(7, NULL, '$2b$10$8G0pMzt5scIlpy2czBq.3e6blY8ixlWDMB0UFa9XLZOvNmKKtaovK', NULL, NULL, 'dsad'),
(8, NULL, '$2b$10$92X4J2Ep5.psb5Xf1aBeXeafOKiDYrx5Ed.bUOKoo/oTrZTwyt/nG', NULL, NULL, 'dsadas'),
(9, 'dasd@kiw.ph', '$2b$10$9gyNi67QmyOqODw.P0SBEuiso8pspgJBkCrUCOIu3BXELdUBuygaW', NULL, NULL, 'dsadsa'),
(10, 'marjoriedasdassaison9@gmail.com', '$2b$10$lD0orw6n9wR.3iF0806UA.XWRVb0CDdC8mCWyRQ3kRpS5hwProHwG', 'dasdasdasdas', '/uploads/file-1769561218421-305101612.png', 'dsadsa'),
(11, 'bacsec@example.com', '$2b$10$5p8wn7ttXFxU0HVXsBo6.OvPMgO7YEtTMDdsqBdA8dQi88jW80GVi', NULL, NULL, 'dasd'),
(12, 'agena@kiw.kiw', '$2b$10$r0Fu7Cs/xaJfe/Mvsl429.iob6l6KprKRzUqW67B8QVKGdCmINmuq', NULL, NULL, 'joshua');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`email`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
