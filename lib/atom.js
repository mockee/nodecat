var uuid = require('node-uuid');

module.exports.generate = function(data) {

  var atom = [
    '<?xml version="1.0" encoding="utf-8" ?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    '<title>' + data.title + '</title>',
    '<subtitle>Happiness only real when shared.</subtitle>',
    '<link href="' + data.url + '" />',
    '<updated>' + data.notes[0].updated + '</updated>',
    '<author><name>' + data.author + '</name></author>',
    '<id>urn:uuid:' + uuid() + '</id>'
  ];

  data.notes.forEach(function(note) {
    atom.concat([
      '<entry>',
      '<title>' + note.title + '</title>',
      '<link href="' + data.url + note.url + '" />',
      '<id>urn:uuid:' + note.uuid + '</id>',
      '<updated>' + note.updated + '</updated>',
      '<content type="html" xml:base="' + data.url
        + '" xml:lang="en"><![CDATA[' + note.content + ']]></content>',
      '</entry>'
    ]);
  });

  atom.push('</feed>');
  return atom.join('\n');
};
