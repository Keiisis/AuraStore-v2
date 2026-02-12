-- Fonction de secours pour récupérer une commande par session ID en contournant RLS
create or replace function get_order_by_provider_id(p_provider_id text)
returns jsonb
language plpgsql
security definer -- EXECUTE AVEC LES DROITS DE L'ADMIN
as $$
declare
    v_order record;
    v_store record;
begin
    select * into v_order from orders where provider_order_id = p_provider_id limit 1;
    
    if v_order.id is null then
        -- Fallback: search in notes
        select * into v_order from orders where notes ilike '%' || p_provider_id || '%' limit 1;
    end if;

    if v_order.id is not null then
        select * into v_store from stores where id = v_order.store_id;
        
        return jsonb_build_object(
            'order', row_to_json(v_order),
            'store', row_to_json(v_store)
        );
    end if;

    return null;
end;
$$;
