use MIA_Practica1;
create table if not exists PRODUCTO(
	id_producto int primary key not null auto_increment,
    nombre_producto varchar(40),
    categoria_producto varchar(40),
    precio_unitario float
);

create table if not exists COMPANIA(
	id_compania int primary key not null auto_increment,
    nombre_compania varchar(50),
    contacto_compania varchar(50),
    correo_compania varchar(60),
    telefono_compania varchar(12)
);

create table if not exists REGION(
	id_region int primary key not null auto_increment,
    nombre_region varchar(50)
);

create table if not exists CIUDAD(
	id_ciudad int primary key not null auto_increment,
    nombre_ciudad varchar(50),
    region int references REGION (id_region)
);

create table if not exists UBICACION(
	id_ubicacion int primary key not null auto_increment,
    codigo_postal int,
    direccion varchar(50),
    ciudad int references CIUDAD (codigo_postal)
);

create table if not exists PERSONA(
	id_persona int primary key not null auto_increment,
    tipo varchar(1),
    nombre varchar(40),
    correo varchar(60),
    telefono varchar(12),
    fecha_registro date,
    ubicacion int references UBICACION(id_ubicacion)
);

create table if not exists ORDEN_VENTA(
	id_venta int primary key not null auto_increment,
    compania int references COMPANIA(id_compania),
    cliente int references PERSONA(id_persona),
    producto int references PRODUCTO(id_producto),
    cantidad int,
    precio_total float(40)
);

create table if not exists ORDEN_COMPRA(
	id_compra int primary key not null auto_increment,
    compania int references COMPANIA(id_compania),
    proveedor int references PERSONA(id_persona),
    producto int references PRODUCTO(id_producto),
    cantidad int,
    precio_total float(40)
);
