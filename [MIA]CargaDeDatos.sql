use MIA_Practica1;

drop table if exists TEMPORAL;
create table if not exists TEMPORAL(
		nombre_compania varchar(50),
        contacto_compania varchar(50),
        correo_compania varchar(60),
        telefono_compania varchar(12),
        tipo varchar(1),
        nombre varchar(40),
        correo varchar(60),
        telefono varchar(12),
        fecha_registro date,
        direccion varchar(50),
        nombre_ciudad varchar(50),
        codigo_postal int,
        nombre_region varchar(50),
        nombre_producto varchar(40),
        categoria_producto varchar(40),
        cantidad int,
        precio_unitario decimal(5,2)
);
#carga masiva
SET GLOBAL local_infile=1;
LOAD DATA INFILE '/var/lib/mysql-files/DataCenterData.csv'
INTO TABLE TEMPORAL
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(nombre_compania, contacto_compania, correo_compania, telefono_compania, tipo, nombre, correo, telefono, @FECHAINI, direccion, nombre_ciudad, codigo_postal, nombre_region, nombre_producto, categoria_producto, cantidad, precio_unitario)
SET fecha_registro = STR_TO_DATE(@FECHAINI,'%d/%m/%Y');


insert into PRODUCTO (nombre_producto, categoria_producto, precio_unitario) select distinct nombre_producto, categoria_producto, precio_unitario from TEMPORAL;
insert into COMPANIA (nombre_compania, contacto_compania, correo_compania, telefono_compania) select distinct nombre_compania, contacto_compania, correo_compania, telefono_compania from TEMPORAL;
insert into REGION (nombre_region) select distinct nombre_region from TEMPORAL;
insert into CIUDAD (nombre_ciudad, region) 
	select distinct nombre_ciudad, 
		(select id_region from REGION reg where reg.nombre_region = tmp.nombre_region group by id_region)
	from TEMPORAL tmp;
insert into UBICACION (codigo_postal, direccion, ciudad)
	select distinct codigo_postal, direccion,
		(select id_ciudad from CIUDAD ciu where ciu.nombre_ciudad = tmp.nombre_ciudad)
	from TEMPORAL tmp;

insert into PERSONA (tipo, nombre, correo, telefono, fecha_registro, ubicacion) 
	select distinct tipo, nombre, correo, telefono, fecha_registro, 
		(select id_ubicacion from UBICACION ubi where ubi.codigo_postal = tmp.codigo_postal and ubi.direccion = tmp.direccion) #ubicacion
    from TEMPORAL tmp;
insert into ORDEN_VENTA (compania, cliente, producto, cantidad, precio_total)
	select 
		(select id_compania from COMPANIA com where com.nombre_compania = tmp.nombre_compania), #compania
		(select id_persona from PERSONA per where per.nombre = tmp.nombre), #cliente
        (select id_producto from PRODUCTO pro where pro.nombre_producto = tmp.nombre_producto), #producto
        cantidad, precio_unitario*cantidad
	from TEMPORAL tmp where tipo='C';
insert into ORDEN_COMPRA (compania, proveedor, producto, cantidad, precio_total)
	select 
		(select id_compania from COMPANIA com where com.nombre_compania = tmp.nombre_compania), #compania
		(select id_persona from PERSONA per where per.nombre = tmp.nombre), #proveedor
        (select id_producto from PRODUCTO pro where pro.nombre_producto = tmp.nombre_producto), #producto
        cantidad, precio_unitario*cantidad
	from TEMPORAL tmp where tipo='P';
