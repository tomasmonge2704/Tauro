-- Función para obtener el conteo de usuarios por grupo
CREATE OR REPLACE FUNCTION get_user_count_by_grupo()
RETURNS TABLE (
  grupo TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(u.grupo, 'Sin grupo') AS grupo,
    COUNT(*) AS count
  FROM 
    users u
  GROUP BY 
    u.grupo
  ORDER BY 
    count DESC;
END;
$$; 
