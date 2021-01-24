use MIA_Practica1;
# consulta1
select pro.nombre as nombre_proveedor, pro.telefono, id_compra as numero_orden, precio_total as total_orden
	from ORDEN_COMPRA 
    inner join PERSONA pro
    on proveedor = pro.id_persona 
    where precio_total = (select max(precio_total) from ORDEN_COMPRA);

# consulta2
select cliente, cli.nombre, sum(cantidad) as total_productos 
	from ORDEN_VENTA 
    inner join PERSONA cli
    on cliente = cli.id_persona
    group by cliente 
    order by total_productos desc limit 1;

# consulta3
(select UBI.direccion, REG.nombre_region as region, CIU.nombre_ciudad as ciudad, UBI.codigo_postal, count(*) as apariciones, 'mas apariciones' as clasificacion
	from ORDEN_COMPRA
    inner join PERSONA PRO
    on proveedor = PRO.id_persona
    inner join UBICACION UBI
    on PRO.ubicacion = UBI.id_ubicacion
    inner join CIUDAD CIU
    on UBI.ciudad = CIU.id_ciudad
    inner join REGION REG
    on CIU.region = REG.id_region
    group by ubicacion
    order by apariciones desc limit 1)
union
(select UBI.direccion, REG.nombre_region, CIU.nombre_ciudad, UBI.codigo_postal, count(*) as apariciones, 'menos apariciones' as clasificacion
	from ORDEN_COMPRA
    inner join PERSONA PRO
    on proveedor = PRO.id_persona
    inner join UBICACION UBI
    on PRO.ubicacion = UBI.id_ubicacion
    inner join CIUDAD CIU
    on UBI.ciudad = CIU.id_ciudad
    inner join REGION REG
    on CIU.region = REG.id_region
    group by ubicacion
    order by apariciones asc limit 1);

# consulta4
select cliente, CLI.nombre, count(*) as numero_ordenes, sum(precio_total) as total
	from ORDEN_VENTA
    inner join PERSONA CLI
    on cliente = CLI.id_persona
    inner join PRODUCTO PRO
    on producto = PRO.id_producto
    where PRO.categoria_producto = 'Cheese'
    group by cliente
    order by numero_ordenes desc limit 5;

# consulta5
(select month(CLI.fecha_registro) as mes_de_registro, CLI.nombre, sum(precio_total) as total, 'mas compras' as 'clasificacion'
	from ORDEN_VENTA
    inner join PERSONA CLI
    on cliente = CLI.id_persona
    group by cliente
    order by total desc limit 3)
union
(select month(CLI.fecha_registro) as mes_de_registro, CLI.nombre, sum(precio_total) as total, 'menos compras' as 'clasificacion'
	from ORDEN_VENTA
    inner join PERSONA CLI
    on cliente = CLI.id_persona
    group by cliente
    order by total asc limit 3);

# consulta6
(select pro.categoria_producto, sum(precio_total) as total_vendido, 'mas_vendido' as clasificacion
	from ORDEN_COMPRA
    inner join PRODUCTO pro
    on producto = pro.id_producto
    group by pro.categoria_producto
    order by total_vendido desc limit 1)
union
(select pro.categoria_producto, sum(precio_total) as total_vendido, 'menos_vendido' as clasificacion
	from ORDEN_COMPRA
    inner join PRODUCTO pro
    on producto = pro.id_producto
    group by pro.categoria_producto
    order by total_vendido asc limit 1);

# consulta7
select prov.nombre, prov.correo, prov.telefono, sum(precio_total) as total
	from ORDEN_COMPRA
    inner join PRODUCTO prod
    on producto = prod.id_producto
    inner join PERSONA prov
    on proveedor = prov.id_persona
    where prod.categoria_producto = 'Fresh Vegetables'
    group by proveedor
    order by total desc limit 5;

# consulta8
(select ubi.direccion, reg.nombre_region, ciu.nombre_ciudad, ubi.codigo_postal, cli.nombre, 'mas ha comprado' as clasificacion
	from ORDEN_VENTA
    inner join PERSONA cli
    on cliente = cli.id_persona
    inner join UBICACION ubi
    on cli.ubicacion = ubi.id_ubicacion
    inner join CIUDAD ciu
    on ubi.ciudad = ciu.id_ciudad
    inner join REGION reg
    on ciu.region = reg.id_region
    group by cliente
    order by sum(precio_total) desc limit 3)
union
(select ubi.direccion, reg.nombre_region, ciu.nombre_ciudad, ubi.codigo_postal, cli.nombre, 'menos ha comprado' as clasificacion
	from ORDEN_VENTA
    inner join PERSONA cli
    on cliente = cli.id_persona
    inner join UBICACION ubi
    on cli.ubicacion = ubi.id_ubicacion
    inner join CIUDAD ciu
    on ubi.ciudad = ciu.id_ciudad
    inner join REGION reg
    on ciu.region = reg.id_region
    group by cliente
    order by sum(precio_total) asc limit 3);

# consulta9
select prov.nombre, prov.telefono, id_compra as numero_orden, precio_total
	from ORDEN_COMPRA
    inner join PERSONA prov
    on proveedor = prov.id_persona
    where cantidad = (select min(cantidad) from ORDEN_COMPRA)
    and precio_total = (select min(precio_total) from ORDEN_COMPRA);
    
# consulta10
select cliente, CLI.nombre, sum(cantidad) as total_cantidad, sum(precio_total) as total
	from ORDEN_VENTA
    inner join PERSONA CLI
    on cliente = CLI.id_persona
    inner join PRODUCTO PRO
    on producto = PRO.id_producto
    where PRO.categoria_producto = 'Seafood'
    group by cliente
    order by total_cantidad desc limit 10;
