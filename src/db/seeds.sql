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

--
-- Data for Name: roles; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (1, 'Usuario', NULL, '', false, false);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (2, 'Titular', NULL, 'createAssignment, inviteUser, editSubject, assignReviewer', false, true);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (3, 'JTP', NULL, '', false, true);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (4, 'Ayudante', NULL, '', false, true);
INSERT INTO teachhub.roles (id, name, parent_role_id, permissions, active, is_teacher) VALUES (5, 'Alumno', NULL, '', false, false);


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

--
-- Data for Name: users; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (1, '44705155', 'tflopezhidalgo@gmail.com', 'Tomas', 'Lopez Hidalgo', '99840', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (2, '3144', 'sebastian@gmail.com', 'Sebastian', 'Penna', '98840', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (3, '1', 'agustin@example.com', 'Agustín', 'Gomez', '102912', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (4, '2', 'mariano@example.com', 'Mariano', 'Gutierrez', '92121', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (5, '3', 'maria@example.com', 'Maria', 'Margarita', '103112', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (6, '4', 'jose@example.com', 'Jose', 'Salvupeda', '13131', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (7, '4', 'agustina.montes@example.com', 'Agustina', 'Montes', '131101', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (8, '5', 'laura.veronica@example.com', 'Laura', 'Veronica', '99841', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (9, '6', 'blancanieves@example.com', 'Blanca', 'Nieves', '91810', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (10, '7', 'martin@example.com', 'Martín', 'Izarazu', '313141', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (11, '313', 'marcelo@example.com', 'Marcelo', 'Gomez', '991821', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (12, '314', 'augusto@example.com', 'Augusto', 'Jus', '991822', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (13, '315', 'santiago@example.com', 'Santiago', 'Veraz', '991823', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (14, '316', 'facundo@example.com', 'Facundo', 'Lamanna', '991834', true);
INSERT INTO teachhub.users (id, github_id, notification_email, name, last_name, file, active) VALUES (15, '317', 'gonzalez@example.com', 'Gonzalo', 'Gonzalez', '991835', true);

--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

-- Profesores

INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (1, 2, 4, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (2, 2, 9, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (3, 2, 5, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (4, 2, 6, 4, true);

-- Alumnos

INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (5, 5, 6, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (6, 5, 6, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (7, 5, 6, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (8, 5, 7, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (9, 5, 7, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (10, 5, 7, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (11, 5, 8, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (12, 5, 8, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (13, 5, 9, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (14, 5, 10, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (15, 5, 11, 2, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (16, 5, 10, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (17, 5, 13, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (18, 5, 10, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (19, 5, 10, 4, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (20, 2, 1, 3, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (21, 3, 1, 1, true);
INSERT INTO teachhub.user_roles (id, role_id, user_id, course_id, active) VALUES (22, 5, 1, 4, true);

--
-- Data for Name: assignments; Type: TABLE DATA; Schema: teachhub; Owner: tomas
--

INSERT INTO teachhub.assignments
    (id, course_id, start_date, end_date, link, title, allow_late_submissions, description)
VALUES
    (1, 2,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Algoritmos simples', true, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (2, 3,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Estructuras de datos', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (3, 4,  '2023-01-15 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Almacenamiento dinamico', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (4, 1,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Concurrencia', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (5, 2,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Transacciones', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (6, 3,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Lenguajes funcionales', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (7, 4,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Estadisticas y operaciones', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (8, 1,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Compiladores', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (9, 2,  '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Operaciones binarias', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (10, 3, '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Aritmetica de punteros', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

'),
    (11, 4, '2023-01-01 00:00:00.000000 +00:00', '2023-01-01 00:00:00.000000 +00:00', 'http://google.com', 'Manejo de memoria', false, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend, enim a venenatis gravida, lorem mi aliquam dui, eget lacinia nisl leo in velit. Duis fermentum erat vitae eros commodo congue. Curabitur blandit odio quis velit vulputate varius. Donec vel libero aliquam augue fringilla iaculis. Nam ultricies, mauris ut dictum condimentum, leo ipsum imperdiet libero, interdum laoreet nisl lectus tristique nisl. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla et lacus sed tortor laoreet placerat. Nullam viverra sem justo. Duis porta molestie risus. Pellentesque dapibus nec erat at ullamcorper. Donec condimentum in massa a tincidunt. Vestibulum auctor rutrum venenatis. Quisque semper eros nec massa semper, non blandit arcu aliquet. Cras laoreet, felis vel lobortis rutrum, mi nisi suscipit eros, vitae ornare enim nisi sit amet neque. Quisque non finibus velit.

');


