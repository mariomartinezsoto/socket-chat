const { io } = require('../server');
const { Usuarios } = require('./clases/usuarios')
const usuarios = new Usuarios()
const { crearMensaje } = require('../sockets/utilidades/utilidades')

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre y sala es necesario'
            })
        }
        console.log(data);
        client.join(data.sala)

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala)
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} entro a sala ${data.sala}`))
        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala))
        callback(usuarios.getPersonasPorSala(data.sala))
    })

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id)
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salio de sala ${personaBorrada.sala}`))
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala))
    })

    client.on('crearMensaje', (data, callback) => {
        let persona = usuarios.getPersona(client.id)
        let mensaje = crearMensaje(persona.nombre, data.mensaje)
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
        callback(mensaje)
    })

    client.on('mensajePrivado', (data) => {
        let persona = usuarios.getPersona(client.id)
        client.broadcast.to(data.para).emit('crearMensaje', crearMensaje(persona.nombre, data.mensaje))
    })
});