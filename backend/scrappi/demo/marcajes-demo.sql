-- Marcajes de demostración de sCrappi: las dos últimas semanas hábiles, relativas al día en que se ejecuta.
-- Se puede ejecutar varias veces: primero borra los marcajes de demostración anteriores.
--
-- Requisitos: la estación 1 y los usuarios de demostración (crestrepo, agomez, vrios, smejia)
-- creados por la API (ver README). tagude es la administradora.
--
-- Ejecutar:  psql -h localhost -U postgres -d db_scrappi -f demo/marcajes-demo.sql

BEGIN;

-- 1. Limpieza: marcajes de los usuarios de demostración y de tagude (salvo su primer marcaje real, id 1)
DELETE FROM worklog
WHERE user_id IN (SELECT id FROM users WHERE user_name IN ('crestrepo', 'agomez', 'vrios', 'smejia', 'tagude'))
  AND id <> 1;

SELECT setseed(0.2026);  -- mismas horas "aleatorias" en cada ejecución

-- 2. Jornadas cerradas de lunes a viernes de los últimos 13 días (sin hoy).
--    faltas: días (en offset desde hoy) en que esa persona no marcó, para que el gráfico tenga variación.
WITH personas(user_name, estacion, faltas) AS (
  VALUES ('tagude',    1, ARRAY[3]),
         ('crestrepo', 2, ARRAY[]::int[]),
         ('agomez',    1, ARRAY[]::int[]),
         ('vrios',     1, ARRAY[2, 9]),
         ('smejia',    1, ARRAY[1, 4, 8])
),
dias AS (
  SELECT (current_date - n) AS dia, n
  FROM generate_series(1, 13) AS n
  WHERE EXTRACT(ISODOW FROM current_date - n) < 6
),
jornadas AS (
  SELECT u.id AS user_id,
         p.estacion,
         d.dia + time '06:45' + (random() * interval '40 minutes') AS entrada,
         d.dia + time '15:50' + (random() * interval '45 minutes') AS salida,
         ws.latitude  + (random() - 0.5) * 0.0004 AS lat_in,
         ws.longitude + (random() - 0.5) * 0.0004 AS lon_in,
         ws.latitude  + (random() - 0.5) * 0.0004 AS lat_out,
         ws.longitude + (random() - 0.5) * 0.0004 AS lon_out
  FROM personas p
  JOIN users u ON u.user_name = p.user_name
  JOIN workstation ws ON ws.id = p.estacion
  CROSS JOIN dias d
  WHERE NOT (d.n = ANY (p.faltas))
)
INSERT INTO worklog (user_id, workstation_id, hour_check_in, hour_check_out,
                     latitude_in, longitude_in, latitude_out, longitude_out, complete, created_at)
SELECT user_id, estacion, entrada, salida, lat_in, lon_in, lat_out, lon_out, true, entrada
FROM jornadas;

-- 3. Hoy: Valentina ya marcó la entrada y sigue en su jornada (aparece como PENDIENTE en reportes).
--    tagude no tiene marcaje hoy, para registrar la entrada en vivo durante la demostración.
INSERT INTO worklog (user_id, workstation_id, hour_check_in, latitude_in, longitude_in, complete, created_at)
SELECT u.id, 1, current_date + time '07:04:12', 6.35112, -75.55591, false, current_date + time '07:04:12'
FROM users u WHERE u.user_name = 'vrios';

COMMIT;

SELECT u.user_name, COUNT(*) AS marcajes, SUM(CASE WHEN w.complete THEN 0 ELSE 1 END) AS abiertos
FROM worklog w JOIN users u ON u.id = w.user_id
GROUP BY u.user_name ORDER BY u.user_name;
