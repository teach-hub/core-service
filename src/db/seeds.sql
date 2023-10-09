--
-- PostgreSQL database dump
--

-- Dumped from database version 11.19
-- Dumped by pg_dump version 14.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET row_security = off;


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.subjects (id, name, code, active) VALUES (1, 'Algoritmos y programación 1', '69.12', false);
INSERT INTO teachhub.subjects (id, name, code, active) VALUES (2, 'Organización de computadoras', '91.12', false);
INSERT INTO teachhub.subjects (id, name, code, active) VALUES (3, 'Algoritmos y programación 2', '12.41', true);
INSERT INTO teachhub.subjects (id, name, code, active) VALUES (4, 'Introducción a Sistemas distribuídos', '51.21', true);
INSERT INTO teachhub.subjects (id, name, code, active) VALUES (5, 'Estructura del computador', '13.21', true);

SELECT setval('teachhub.subjects_id_seq', (select MAX(id) from teachhub.subjects));

--
-- Data for Name: roles; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (1, 'Usuario', NULL, 'viewHome', false, false);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (2, 'Titular', NULL, 'setOrganization, createRepository, editAssignment, createAssignment, inviteUser, editSubject, assignReviewer, viewGroups, viewAllSubmissions', false, true);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (3, 'JTP', NULL, '', false, true);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (4, 'Ayudante', NULL, '', false, true);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (5, 'Alumno', NULL, 'manageOwnGroups, submitAssignment, viewSubmission', false, false);

SELECT setval('teachhub.roles_id_seq', (select MAX(id) from teachhub.roles));


--
-- Data for Name: invites; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--


--
-- Data for Name: courses; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.courses (id, name, github_organization, period, year, active, subject_id) VALUES (1, 'Curso Gutierrez', NULL, '1', 2022, true, 1);
INSERT INTO teachhub.courses (id, name, github_organization, period, year, active, subject_id) VALUES (2, 'Curso Gonzalez', NULL, '1', 2023, true, 2);
INSERT INTO teachhub.courses (id, name, github_organization, period, year, active, subject_id) VALUES (3, 'Curso Blancanieves', NULL, '1', 2022, true, 1);
INSERT INTO teachhub.courses (id, name, github_organization, period, year, active, subject_id) VALUES (4, 'Curso Salvupeda', NULL, '2', 2022, true, 3);

SELECT setval('teachhub.courses_id_seq', (select MAX(id) from teachhub.courses));

--
-- Data for Name: users; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (1, '44705155', 'tflopezhidalgo@gmail.com', 'Tomas', 'Lopez Hidalgo', '99840', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (2, '3144', 'sebastian@gmail.com', 'Sebastian', 'Penna', '98840', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (3, '5', 'laura.veronica@example.com', 'Laura', 'Veronica', '99841', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (4, '2', 'mariano@example.com', 'Mariano', 'Gutierrez', '92121', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (5, '3', 'maria@example.com', 'Maria', 'Margarita', '103112', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (6, '4', 'jose@example.com', 'Jose', 'Salvupeda', '13131', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (7, '4', 'agustina.montes@example.com', 'Agustina', 'Montes', '131101', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (8, '317', 'gonzalez@example.com', 'Gonzalo', 'Gonzalez', '991835', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (9, '6', 'blancanieves@example.com', 'Blanca', 'Nieves', '91810', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (10, '7', 'martin@example.com', 'Martín', 'Izarazu', '313141', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (11, '313', 'marcelo@example.com', 'Marcelo', 'Gomez', '991821', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (12, '314', 'augusto@example.com', 'Augusto', 'Jus', '991822', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (13, '315', 'santiago@example.com', 'Santiago', 'Veraz', '991823', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (14, '316', 'facundo@example.com', 'Facundo', 'Lamanna', '991834', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (15, '137667490', 'teachhuborg@outlook.com', 'TeachHub', 'Fake', '102912', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (16, '318', 'manuel@example.com', 'Manuel', 'Aranguren', '101231', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (17, '319', 'silvina@example.com', 'Silvina', 'Garcia', '911835', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (18, '320', 'alberto@example.com', 'Alberto', 'Morales', '921835', true);

SELECT setval('teachhub.users_id_seq', (select MAX(id) from teachhub.users));

--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

-- Profesores

INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (1, 2, 4, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (2, 2, 9, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (3, 2, 5, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (4, 2, 6, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (5, 2, 1, 3, true);


-- Alumnos

INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (105, 5, 6, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (106, 5, 6, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (107, 5, 6, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (108, 5, 7, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (109, 5, 7, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (110, 5, 7, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (111, 5, 8, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (112, 5, 8, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (113, 5, 9, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (114, 5, 10, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (115, 5, 10, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (116, 5, 10, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (117, 5, 11, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (118, 5, 11, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (119, 5, 11, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (120, 5, 12, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (121, 5, 12, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (122, 5, 12, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (123, 5, 12, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (124, 5, 13, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (125, 5, 13, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (126, 5, 13, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (127, 5, 13, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (128, 5, 14, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (129, 5, 14, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (130, 5, 14, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (131, 5, 14, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (132, 5, 15, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (133, 5, 15, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (134, 5, 15, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (135, 5, 15, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (136, 5, 16, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (137, 5, 16, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (138, 5, 16, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (139, 5, 16, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (140, 5, 17, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (141, 5, 17, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (142, 5, 17, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (143, 5, 17, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (144, 5, 18, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (145, 5, 18, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (146, 5, 18, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (147, 5, 18, 4, true);

-- Profesores siendo alumnos

INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (148, 5, 1, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (149, 5, 1, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (150, 5, 1, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (151, 5, 4, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (152, 5, 4, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (153, 5, 4, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (154, 5, 9, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (155, 5, 9, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (156, 5, 5, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (157, 5, 5, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (158, 5, 5, 4, true);

SELECT setval('teachhub.user_roles_id_seq', (select MAX(id) from teachhub.user_roles));

--
-- Data for Name: assignments; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.assignments
    (id, course_id, start_date, end_date, link, title, allow_late_submissions, description, is_group)
VALUES
    (1, 2,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Algoritmos simples', true, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (2, 3,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Estructuras de datos', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (3, 4,  '2023-01-15 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Almacenamiento dinamico', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (4, 1,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Concurrencia', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (5, 2,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Transacciones', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (6, 3,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Lenguajes funcionales', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (7, 4,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Estadisticas y operaciones', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (8, 1,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Compiladores', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', true),
    (9, 2,  '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Operaciones binarias', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', false),
    (10, 3, '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Aritmetica de punteros', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', false),
    (11, 4, '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Manejo de memoria', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', false),
    (12, 1, '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Manejo de operationes basicas', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', false),
    (13, 2, '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Sistemas Distribuidos', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', false),
    (14, 3, '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Electronica', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', false),
    (15, 4, '2023-01-01 00:00:00.000000 +00:00', '2023-09-01 00:00:00.000000 +00:00', 'http://google.com', 'Operaciones binarias', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit. ', false);


SELECT setval('teachhub.assignments_id_seq', (select MAX(id) from teachhub.assignments));

--
-- Data for Name: groups; Type: TABLE DATA; Schema: teachhub; Owner: postgres
--

INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (1, 1, 4, 'Grupo 4 - 0' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (2, 1, 4, 'Grupo 4 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (3, 1, 4, 'Grupo 4 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (4, 1, 4, 'Grupo 4 - 3' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (5, 1, 8, 'Grupo 8 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (6, 1, 8, 'Grupo 8 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (7, 1, 8, 'Grupo 8 - 3' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (8, 1, 8, 'Grupo 8 - 4' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (9, 2, 1, 'Grupo 1 - 0' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (10, 2, 1, 'Grupo 1 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (11, 2, 1, 'Grupo 1 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (12, 2, 1, 'Grupo 1 - 3' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (13, 2, 5, 'Grupo 5 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (14, 2, 5, 'Grupo 5 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (15, 2, 5, 'Grupo 5 - 3' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (16, 2, 5, 'Grupo 5 - 4' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (17, 3, 2, 'Grupo 2 - 0' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (18, 3, 2, 'Grupo 2 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (19, 3, 2, 'Grupo 2 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (20, 3, 2, 'Grupo 2 - 3' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (21, 3, 6, 'Grupo 6 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (22, 3, 6, 'Grupo 6 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (23, 3, 6, 'Grupo 6 - 3' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (24, 3, 6, 'Grupo 6 - 4' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (25, 4, 7, 'Grupo 7 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (26, 4, 7, 'Grupo 7 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (27, 4, 7, 'Grupo 7 - 3' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (28, 4, 7, 'Grupo 7 - 4' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (29, 4, 3, 'Grupo 3 - 0' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (30, 4, 3, 'Grupo 3 - 1' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (31, 4, 3, 'Grupo 3 - 2' ,true);
INSERT INTO teachhub.groups (id, course_id, assignment_id, name, active) VALUES (32, 4, 3, 'Grupo 3 - 3' ,true);

SELECT setval('teachhub.groups_id_seq', (select MAX(id) from teachhub.groups));

--
-- Data for Name: group_participants; Type: TABLE DATA; Schema: teachhub; Owner: postgres
--

INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (5, 105, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (5, 108, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (5, 111, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (5, 113, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (6, 114, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (6, 117, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (6, 120, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (6, 124, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (7, 128, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (7, 132, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (7, 136, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (7, 140, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (8, 144, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (8, 148, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (8, 156, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (1, 105, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (1, 108, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (1, 111, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (1, 113, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (2, 114, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (2, 117, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (2, 120, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (2, 124, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (3, 128, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (3, 132, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (3, 136, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (3, 140, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (4, 144, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (4, 148, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (4, 156, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (13, 106, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (13, 109, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (13, 112, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (13, 118, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (14, 121, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (14, 125, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (14, 129, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (14, 133, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (15, 137, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (15, 141, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (15, 145, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (15, 149, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (16, 151, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (16, 157, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (9, 106, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (9, 109, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (9, 112, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (9, 118, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (10, 121, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (10, 125, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (10, 129, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (10, 133, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (11, 137, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (11, 141, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (11, 145, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (11, 149, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (12, 151, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (12, 157, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (17, 107, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (17, 110, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (17, 115, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (17, 119, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (18, 122, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (18, 126, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (18, 130, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (18, 134, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (19, 138, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (19, 142, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (19, 146, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (19, 152, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (20, 154, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (21, 107, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (21, 110, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (21, 115, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (21, 119, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (22, 122, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (22, 126, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (22, 130, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (22, 134, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (23, 138, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (23, 142, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (23, 146, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (23, 152, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (24, 154, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (29, 116, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (29, 123, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (29, 127, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (30, 131, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (30, 135, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (30, 139, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (31, 143, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (31, 147, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (31, 150, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (32, 153, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (32, 155, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (32, 158, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (25, 116, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (25, 123, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (25, 127, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (26, 131, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (26, 135, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (26, 139, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (27, 143, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (27, 147, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (27, 150, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (28, 153, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (28, 155, true);
INSERT INTO teachhub.group_participants (group_id, user_role_id, active) VALUES (28, 158, true);

SELECT setval('teachhub.group_participants_id_seq', (select MAX(id) from teachhub.group_participants));
