// EDA3 - geohot's internal tool of the gods
// Copyright 2011 George Hotz. All rights reserved.

require('js/db.js');

var spanlookup = {
  't':'i_tab',
  'o':'i_opcode',
  'c':'i_condition',
  'f':'i_flags',
  'l':'i_location',
  'L':'i_corelocation',
  'd':'i_deref',
  's':'i_immed',
  'i':'i_immed'};

var spanfunction = {
  't':displayParsed,
  's':parseSignedImmed,
  'i':parseImmed,
  'd':parseDeref,
  'L':parseLocation,
  'l':parseLocation};

function displayParsed(parsed) {
  var ret = "";
  var i;
  if (parsed === null || parsed === undefined) {
    return "empty";
  }
  for (i = 0; i < parsed.length; i++) {
    var c = parsed.substr(i, 1);
    if (c == '\\') {
      i += 1;
      var m = parsed.substr(i, 1);
      i += 2;
      var ss = "";
      var nested = 1;
      var j;
      while (i < parsed.length) {
        c = parsed.substr(i, 1);
        if (c == '{') nested++;
        if (c == '}') nested--;
        if (nested == 0) break;
        ss += c;
        i++;
      }
      if (spanfunction[m] !== undefined) {
        ss = spanfunction[m](ss);
      }
      ret += '<span class="'+spanlookup[m]+'">'+ss+'</span>';
    } else {
      ret += c;
    }
  }
  return ret;
}

function parseSignedImmed(immed) {
  var i = fnum(immed);
  if (i < 0) {
    i *= -1;
    if (i >= 0 && i < 10) return '-'+shex(i);
    else return '-0x'+shex(i);
  } else {
    return parseImmed(immed);
  }
}

function parseImmed(immed) {
  var i = fnum(immed);
  if (i >= 0 && i < 10) return shex(i);
  else return '0x'+shex(i);
}

function parseDeref(ss) {
  var paddr = fnum(ss.substr(2));
  var len = fnum(ss.substr(0,1));
  var endian = (ss.substr(1,1)=='l')?'little':'big';

  //p('dereffing '+shex(paddr));

  var data = db.immed(paddr, len, endian);

  return parseLocation(data);
}

// this shouldn't have to do a network fetch
// and now we have a cache
function parseLocation(ss) {
  if (typeof ss == "string") {
    var addr = fnum(ss);
  } else {
    var addr = ss;
  }
  var tags = db.tags(addr);
  var ret = '<input type="hidden" class="highlight_'+shex(addr)+'" value="'+shex(addr)+'" />';
  if (tags['name'] !== undefined) {
    ret += tags['name'];
  } else {
    ret += '0x'+shex(addr);
  }
  return ret;
}

function displayComment(comment) {
  comment = '; '+comment;  // ensure there's something before the first /
  var cp = comment.split('/');
  var ret = "";
  for (var i = 0; i < cp.length; i++) {
    if (i&1) {
      var addr = shex(eval(cp[i]));
      ret += '<span class="i_location">';
      ret += '<input type="hidden" class="highlight_'+addr+'" value="'+addr+'"></input>';
      ret += '0x'+addr+'</span>'
    } else {
      ret += cp[i];
    }
  }
  return '<span class="comment">'+ret+'</span>';
}

function displayImmedFromRaw(length, endian, rawdata) {
  var row = '<span class="i_immed">0x';
  var i;
  var addr = 0;
  if (endian == 'little') {
    addr += length-1;
  }
  for (i=0;i<length;i++) {
    row += shex(rawdata[addr],2);
    if (endian == 'little') {
      addr -= 1;
    } else {
      addr += 1;
    }
  }
  row += '</span>';
  return row;
}

function displayDumpFromRaw(length, rawdata) {
  var row = '<span class="i_dump">';
  for (var i=0; i<length; i++) {
    row += shex(rawdata[i],2)+" ";
  }
  row += '</span>';
  return row;
}

