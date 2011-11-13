var uuid = require('node-uuid');

module.exports.generate = function (data) {

    var atom = [
        '<?xml version="1.0" encoding="utf-8" ?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">'
    ];

    atom.push('<title>' + data.title + '</title>');
    atom.push('<subtitle>Happiness only real when shared.</subtitle>');
    atom.push('<link href="' + data.url + '" />');
    atom.push('<updated>' + data.notes[0].updated + '</updated>');
    atom.push('<author><name>' + data.author.name + '</name></author>');
    atom.push('<id>urn:uuid:' + uuid() + '</id>');

    data.notes.forEach(function (n) {
        atom.push('<entry>');
        atom.push('<title>' + n.title + '</title>');
        atom.push('<link href="http://www.mockee.com' + n.url + '" />');
        atom.push('<id>urn:uuid:' + n.uuid + '</id>');
        atom.push('<updated>' + n.updated + '</updated>');
        atom.push('<content type="html" xml:base="http://www.mockee.com/" xml:lang="en"><![CDATA[' + n.content + ']]></content>');
        atom.push('</entry>');
    });

    atom.push('</feed>');
    return atom.join('\n');
};
