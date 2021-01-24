
//  Se guarda el modulo 'express' en una constante
const express = require("express");
//  App inicia a express y se guarda en una constante
const app = express();
//  Estableciendo puertos
app.set('port', process.env.PORT || 8000);

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'MIA_Practica1',
    multipleStatements: true,
    port: 3306
});


//  Iniciamos la app
app.listen(app.get('port'), () => {
    console.log(`Server started on port ${app.get('port')}`);
});

app.get('/', (req, res) => {
    //console.log('Just for testing')
    res.send('Hello');
});

app.get('/mundo', async function (req, res) {
    //console.log('Just for testing')
    var sql = 'select nombre from mundo;'   // instruccion sql
    // ejecuta un query contenido en la var sql
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        console.log(JSON.stringify(result));    // formato para ser visualizado en consola
        res.json(result);           // json enviado al cliente
    })
});


app.get('/cargarTemporal', async function (req, res) {
    //console.log('Just for testing')
    var sql = "create table if not exists TEMPORAL(\
		nombre_compania varchar(50),\
        contacto_compania varchar(50),\
        correo_compania varchar(60),\
        telefono_compania varchar(12),\
        tipo varchar(1),\
        nombre varchar(40),\
        correo varchar(60),\
        telefono varchar(12),\
        fecha_registro date,\
        direccion varchar(50),\
        nombre_ciudad varchar(50),\
        codigo_postal int,\
        nombre_region varchar(50),\
        nombre_producto varchar(40),\
        categoria_producto varchar(40),\
        cantidad int,\
        precio_unitario decimal(5,2)\
    );\
    SET GLOBAL local_infile=1;\
    LOAD DATA INFILE \"/var/lib/mysql-files/DataCenterData.csv\" \
    INTO TABLE TEMPORAL \
    FIELDS TERMINATED BY ';' \
    LINES TERMINATED BY '\n' \
    IGNORE 1 LINES \
    (nombre_compania, contacto_compania, correo_compania, telefono_compania, tipo, nombre, correo, telefono, @FECHAINI, direccion, nombre_ciudad, codigo_postal, nombre_region, nombre_producto, categoria_producto, cantidad, precio_unitario) \
    SET fecha_registro = STR_TO_DATE(@FECHAINI,'%d/%m/%Y');";   // instruccion sql
    // ejecuta un query contenido en la var sql
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        console.log("Sí se pudo cargar");    // formato para ser visualizado en consola
        res.send('Carga a la tabla temporal completada con éxito!');
    })
});

app.get('/cargarModelo', async function (req, res) {
    var sql = "create table if not exists PRODUCTO(\
        id_producto int primary key not null auto_increment,\
        nombre_producto varchar(40),\
        categoria_producto varchar(40),\
        precio_unitario float\
    );\
    \
    create table if not exists COMPANIA(\
        id_compania int primary key not null auto_increment,\
        nombre_compania varchar(50),\
        contacto_compania varchar(50),\
        correo_compania varchar(60),\
        telefono_compania varchar(12)\
    );\
    \
    create table if not exists REGION(\
        id_region int primary key not null auto_increment,\
        nombre_region varchar(50)\
    );\
    \
    create table if not exists CIUDAD(\
        id_ciudad int primary key not null auto_increment,\
        nombre_ciudad varchar(50),\
        region int references REGION (id_region)\
    );\
    \
    create table if not exists UBICACION(\
        id_ubicacion int primary key not null auto_increment,\
        codigo_postal int,\
        direccion varchar(50),\
        ciudad int references CIUDAD (codigo_postal)\
    );\
    \
    create table if not exists PERSONA(\
        id_persona int primary key not null auto_increment,\
        tipo varchar(1),\
        nombre varchar(40),\
        correo varchar(60),\
        telefono varchar(12),\
        fecha_registro date,\
        ubicacion int references UBICACION(id_ubicacion)\
    );\
    \
    create table if not exists ORDEN_VENTA(\
        id_venta int primary key not null auto_increment,\
        compania int references COMPANIA(id_compania),\
        cliente int references PERSONA(id_persona),\
        producto int references PRODUCTO(id_producto),\
        cantidad int,\
        precio_total float(40)\
    );\
    \
    create table if not exists ORDEN_COMPRA(\
        id_compra int primary key not null auto_increment,\
        compania int references COMPANIA(id_compania),\
        proveedor int references PERSONA(id_persona),\
        producto int references PRODUCTO(id_producto),\
        cantidad int,\
        precio_total float(40)\
    );\
    \
    insert into PRODUCTO (nombre_producto, categoria_producto, precio_unitario) select distinct nombre_producto, categoria_producto, precio_unitario from TEMPORAL;\
    insert into COMPANIA (nombre_compania, contacto_compania, correo_compania, telefono_compania) select distinct nombre_compania, contacto_compania, correo_compania, telefono_compania from TEMPORAL;\
    insert into REGION (nombre_region) select distinct nombre_region from TEMPORAL;\
    insert into CIUDAD (nombre_ciudad, region) \
        select distinct nombre_ciudad, \
            (select id_region from REGION reg where reg.nombre_region = tmp.nombre_region group by id_region)\
        from TEMPORAL tmp;\
    insert into UBICACION (codigo_postal, direccion, ciudad)\
        select distinct codigo_postal, direccion,\
            (select id_ciudad from CIUDAD ciu where ciu.nombre_ciudad = tmp.nombre_ciudad)\
        from TEMPORAL tmp;\
    insert into PERSONA (tipo, nombre, correo, telefono, fecha_registro, ubicacion) \
        select distinct tmp.tipo, tmp.nombre, correo, telefono, fecha_registro, \
            (select id_ubicacion from UBICACION ubi where ubi.codigo_postal = tmp.codigo_postal and ubi.direccion = tmp.direccion)\
        from TEMPORAL tmp;\
    insert into ORDEN_VENTA (compania, cliente, producto, cantidad, precio_total)\
        select \
            (select id_compania from COMPANIA com where com.nombre_compania = tmp.nombre_compania),\
            (select id_persona from PERSONA per where per.nombre = tmp.nombre),\
            (select id_producto from PRODUCTO pro where pro.nombre_producto = tmp.nombre_producto),\
            cantidad, precio_unitario*cantidad\
        from TEMPORAL tmp where tipo='C';\
    insert into ORDEN_COMPRA (compania, proveedor, producto, cantidad, precio_total)\
        select \
            (select id_compania from COMPANIA com where com.nombre_compania = tmp.nombre_compania), \
            (select id_persona from PERSONA per where per.nombre = tmp.nombre), \
            (select id_producto from PRODUCTO pro where pro.nombre_producto = tmp.nombre_producto), \
            cantidad, precio_unitario*cantidad\
        from TEMPORAL tmp where tipo='P';";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        console.log("Sí se pudo cargar");    // formato para ser visualizado en consola
        res.send('Modelo creado y datos cargados con éxito!');
    })
});


app.get('/eliminarTemporal', async function (req, res) {
    var sql = 'drop table if exists TEMPORAL;'
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        console.log('Se pudo eliminar');
        res.send("Tabla temporal eliminada con éxito");
    })
});


app.get('/eliminarModelo', async function (req, res) {
    var sql = 'drop table if exists PRODUCTO;\
    drop table if exists COMPANIA;\
    drop table if exists REGION;\
    drop table if exists CIUDAD;\
    drop table if exists PERSONA;\
    drop table if exists UBICACION;\
    drop table if exists ORDEN_VENTA;\
    drop table if exists ORDEN_COMPRA;'
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        console.log('Se pudo eliminar');
        res.send("Modelo eliminado con éxito");
    })
});


app.get('/consulta1', async function (req, res) {
    var sql = 'select pro.nombre as nombre_proveedor, pro.telefono, id_compra as numero_orden, precio_total as total_orden\
	from ORDEN_COMPRA \
    inner join PERSONA pro\
    on proveedor = pro.id_persona \
    where precio_total = (select max(precio_total) from ORDEN_COMPRA);'
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});

app.get('/consulta2', async function (req, res) {
    var sql = 'select cliente, cli.nombre, sum(cantidad) as total_productos \
	from ORDEN_VENTA \
    inner join PERSONA cli\
    on cliente = cli.id_persona\
    group by cliente \
    order by total_productos desc limit 1;'
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});

app.get('/consulta3', async function (req, res) {
    var sql = "(select UBI.direccion, REG.nombre_region as region, CIU.nombre_ciudad as ciudad, UBI.codigo_postal, count(*) as apariciones, 'mas apariciones' as clasificacion\
	from ORDEN_COMPRA\
    inner join PERSONA PRO\
    on proveedor = PRO.id_persona\
    inner join UBICACION UBI\
    on PRO.ubicacion = UBI.id_ubicacion\
    inner join CIUDAD CIU\
    on UBI.ciudad = CIU.id_ciudad\
    inner join REGION REG\
    on CIU.region = REG.id_region\
    group by ubicacion\
    order by apariciones desc limit 1)\
union\
(select UBI.direccion, REG.nombre_region, CIU.nombre_ciudad, UBI.codigo_postal, count(*) as apariciones, 'menos apariciones' as clasificacion\
	from ORDEN_COMPRA\
    inner join PERSONA PRO\
    on proveedor = PRO.id_persona\
    inner join UBICACION UBI\
    on PRO.ubicacion = UBI.id_ubicacion\
    inner join CIUDAD CIU\
    on UBI.ciudad = CIU.id_ciudad\
    inner join REGION REG\
    on CIU.region = REG.id_region\
    group by ubicacion\
    order by apariciones asc limit 1);";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});
app.get('/consulta4', async function (req, res) {
    var sql = "select cliente, CLI.nombre, count(*) as numero_ordenes, sum(precio_total) as total\
	from ORDEN_VENTA\
    inner join PERSONA CLI\
    on cliente = CLI.id_persona\
    inner join PRODUCTO PRO\
    on producto = PRO.id_producto\
    where PRO.categoria_producto = 'Cheese'\
    group by cliente\
    order by numero_ordenes desc limit 5;";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});
app.get('/consulta5', async function (req, res) {
    var sql = "(select month(CLI.fecha_registro) as mes_de_registro, CLI.nombre, sum(precio_total) as total, 'mas compras' as 'clasificacion'\
	from ORDEN_VENTA\
    inner join PERSONA CLI\
    on cliente = CLI.id_persona\
    group by cliente\
    order by total desc limit 3)\
    union\
    (select month(CLI.fecha_registro) as mes_de_registro, CLI.nombre, sum(precio_total) as total, 'menos compras' as 'clasificacion'\
	from ORDEN_VENTA\
    inner join PERSONA CLI\
    on cliente = CLI.id_persona\
    group by cliente\
    order by total asc limit 3);";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});
app.get('/consulta6', async function (req, res) {
    var sql = "(select pro.categoria_producto, sum(precio_total) as total_vendido, 'mas_vendido' as clasificacion\
	from ORDEN_COMPRA\
    inner join PRODUCTO pro\
    on producto = pro.id_producto\
    group by pro.categoria_producto\
    order by total_vendido desc limit 1)\
union\
(select pro.categoria_producto, sum(precio_total) as total_vendido, 'menos_vendido' as clasificacion\
	from ORDEN_COMPRA\
    inner join PRODUCTO pro\
    on producto = pro.id_producto\
    group by pro.categoria_producto\
    order by total_vendido asc limit 1);";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});
app.get('/consulta7', async function (req, res) {
    var sql = "select prov.nombre, prov.correo, prov.telefono, sum(precio_total) as total\
	from ORDEN_COMPRA\
    inner join PRODUCTO prod\
    on producto = prod.id_producto\
    inner join PERSONA prov\
    on proveedor = prov.id_persona\
    where prod.categoria_producto = 'Fresh Vegetables'\
    group by proveedor\
    order by total desc limit 5;";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});
app.get('/consulta8', async function (req, res) {
    var sql = "(select ubi.direccion, reg.nombre_region, ciu.nombre_ciudad, ubi.codigo_postal, cli.nombre, 'mas ha comprado' as clasificacion\
	from ORDEN_VENTA\
    inner join PERSONA cli\
    on cliente = cli.id_persona\
    inner join UBICACION ubi\
    on cli.ubicacion = ubi.id_ubicacion\
    inner join CIUDAD ciu\
    on ubi.ciudad = ciu.id_ciudad\
    inner join REGION reg\
    on ciu.region = reg.id_region\
    group by cliente\
    order by sum(precio_total) desc limit 3)\
union\
(select ubi.direccion, reg.nombre_region, ciu.nombre_ciudad, ubi.codigo_postal, cli.nombre, 'menos ha comprado' as clasificacion\
	from ORDEN_VENTA\
    inner join PERSONA cli\
    on cliente = cli.id_persona\
    inner join UBICACION ubi\
    on cli.ubicacion = ubi.id_ubicacion\
    inner join CIUDAD ciu\
    on ubi.ciudad = ciu.id_ciudad\
    inner join REGION reg\
    on ciu.region = reg.id_region\
    group by cliente\
    order by sum(precio_total) asc limit 3);";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});
app.get('/consulta9', async function (req, res) {
    var sql = "select prov.nombre, prov.telefono, id_compra as numero_orden, precio_total\
	from ORDEN_COMPRA\
    inner join PERSONA prov\
    on proveedor = prov.id_persona\
    where cantidad = (select min(cantidad) from ORDEN_COMPRA)\
    and precio_total = (select min(precio_total) from ORDEN_COMPRA);"
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});
app.get('/consulta10', async function (req, res) {
    var sql = "select cliente, CLI.nombre, sum(cantidad) as total_cantidad, sum(precio_total) as total\
	from ORDEN_VENTA\
    inner join PERSONA CLI\
    on cliente = CLI.id_persona\
    inner join PRODUCTO PRO\
    on producto = PRO.id_producto\
    where PRO.categoria_producto = 'Seafood'\
    group by cliente\
    order by total_cantidad desc limit 10;";
    connection.query(sql, async function (err, result) {
        if (err) {
            res.send('No pudo conectar :c (ver servidor)')
            throw err;
        }
        //console.log(JSON.stringify(result));
        res.json(result);
    })
});