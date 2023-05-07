WITH event_data_query AS (
  SELECT d.website_event_id,
    jsonb_object_agg(
      d.event_key,
      CASE
        d.event_data_type
        when 1 then to_jsonb(d.event_string_value) -- string
        when 2 then to_jsonb(d.event_numeric_value) -- number
        when 3 then to_jsonb(d.event_bool_value) -- boolean
        when 4 then to_jsonb(d.event_date_value) -- date
        when 5 then d.event_string_value::jsonb -- array
      end
    ) filter (
      where d.event_key is not null
    ) as event_data
  FROM event_data d
  GROUP BY d.website_event_id
)
select e.event_name x,
  to_char(
    date_trunc('hour', e.created_at),
    'YYYY-MM-DD HH24:00:00'
  ) c,
  edq.event_data::jsonb->'data.target' t,
  edq.event_data::jsonb->'data.release' r
from website_event e
  LEFT JOIN event_data_query edq ON e.event_id = edq.website_event_id
where e.event_name = 'Outbound click'
  or e.event_name = 'NewSong PRO click'
order by c desc
