// http://cookbook.mongodb.org/patterns/count_tags/
var tagMap = function() {
    if (!this.tags) {
        return;
    }

    for (index in this.tags) {
        emit(this.tags[index], 1);
    }
};

var tagReduce = function(previous, current) {
    var count = 0;

    for (index in current) {
        count += current[index];
    }

    return count;
};

var command = {
  mapreduce: 'notes',
  map: tagMap.toString(),
  reduce: tagReduce.toString(),
  out: 'tags'
};

