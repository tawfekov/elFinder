elFinder.prototype.view = function(fm, el) {
	var self = this;
	this.fm = fm;
	
	this.kinds = {
		'directory'                     : 'Directory',
		'symlink'                       : 'Alias',
		'unknown'                       : 'Unknown',
		'text/plain'                    : 'Plain text',
	    'text/x-php'                    : 'PHP source',
		'text/javascript'               : 'Javascript source',
		'text/css'                      : 'CSS style sheet',  
	    'text/html'                     : 'HTML document', 
		'text/x-c'                      : 'C source', 
		'text/x-c++'                    : 'C++ source', 
		'text/x-shellscript'            : 'Unix shell script',
	    'text/rtf'                      : 'Rich Text Format (RTF)',
		'text/rtfd'                     : 'RTF with attachments (RTFD)', 
	    'text/xml'                      : 'XML document', 
		'application/xml'               : 'XML document', 
		'application/x-tar'             : 'TAR archive', 
	    'application/x-gzip'            : 'GZIP archive', 
	    'application/x-bzip2'           : 'BZIP archive', 
	    'application/x-zip'             : 'ZIP archive',  
	    'application/zip'               : 'ZIP archive',  
	    'application/x-rar'             : 'RAR archive',  
	    'image/jpeg'                    : 'JPEG image',   
	    'image/gif'                     : 'GIF Image',    
	    'image/png'                     : 'PNG image',    
	    'image/tiff'                    : 'TIFF image',   
	    'image/vnd.adobe.photoshop'     : 'Adobe Photoshop image',
	    'application/pdf'               : 'Portable Document Format (PDF)',
	    'application/msword'            : 'Microsoft Word document',  
		'application/vnd.ms-office'     : 'Microsoft Office document',
		'application/vnd.ms-word'       : 'Microsoft Word document',  
	    'application/msexel'            : 'Microsoft Excel document', 
	    'application/vnd.ms-excel'      : 'Microsoft Excel document', 
		'application/octet-stream'      : 'Application', 
		'audio/mpeg'                    : 'MPEG audio',  
		'video/mpeg'                    : 'MPEG video',  
		'video/x-msvideo'               : 'AVI video',   
		'application/x-shockwave-flash' : 'Flash application', 
		'video/x-flv'                   : 'Flash video'
	}
	
	this.tree = null;
	this.tlb  = $('<ul />');
	this.plc  = $('<div />').addClass('el-finder-places').append($('<label />').text('Places'));
	this.nav  = $('<div />').addClass('el-finder-nav');
	this.cwd  = $('<div />').addClass('el-finder-cwd');
	this.spn  = $('<div />').addClass('el-finder-spinner');
	this.msg  = $('<p />').addClass('el-finder-info');
	this.nfo  = $('<div />').addClass('stat');
	this.pth  = $('<div />').addClass('path');
	this.sel  = $('<div />').addClass('selected-files');
	this.stb  = $('<div />').addClass('el-finder-statusbar')
		.append(this.pth)
		.append(this.nfo)
		.append(this.sel);
	this.wrz  = $('<div />').addClass('el-finder-workzone')
		.append(this.nav)
		.append(this.cwd)
		.append(this.spn)
		.append(this.msg)
		.append('<div style="clear:both" />');
	this.win  = $(el).empty().addClass('el-finder').addClass(fm.options.cssClass||'')
		.append($('<div />').addClass('el-finder-toolbar').append(this.tlb))
		.append(this.wrz)
		.append(this.stb);


	this.spinner = function(show) {
		if (show) {
			this.win.addClass('el-finder-disabled');
			this.spn.show();
		} else {
			this.win.removeClass('el-finder-disabled');
			this.spn.hide();
		}
	}
	
	this.error = function(m) {
		this.fm.lock();
		this.msg.empty().removeClass('el-finder-warning').addClass('el-finder-error').text(self.fm.i18n(m)).show();
		setTimeout(function() { self.msg.fadeOut('slow'); }, 2000);
	}
	
	this.warning = function(m) {
		this.msg.empty().removeClass('el-finder-error').addClass('el-finder-warning').text(self.fm.i18n(m)).show();
		setTimeout(function() { self.msg.fadeOut('slow'); }, 2000);
	}
	
	this.message = function(m) {
		this.msg.empty().removeClass('el-finder-error').removeClass('el-finder-warning').text(self.fm.i18n(m)).show();
		setTimeout(function() { self.msg.fadeOut('slow'); }, 2000);
	}

	this.renderNav = function(tree) {
		
		this.tree = this.nav.html(traverse(tree, true)).children('ul');

		function traverse(tree, root) {
			var i, c, html = '<ul>';
			for (i in tree) {
				fm.dirs[i] = {
					name  : tree[i].name,
					read  : tree[i].read,
					write : tree[i].write
				};

				if (root) {
					c = 'root selected';
				} else if (!tree[i].read) {
					c = 'noaccess';
				} else if (!tree[i].write) {
					c = 'ro';
				} else {
					c = '';
				}

				html += '<li>'+(root ? '' : '<div class="dir-handler'+(tree[i].dirs ? ' dir-collapsed' : '')+'"></div>')+'<a href="#" class="'+c+'" key="'+i+'">'+tree[i].name+'</a>';
				if (tree[i].dirs) {
					html += traverse(tree[i].dirs);
				}
				html += '</li>';
			}
			return html +'</ul>';
		}
	}
	
	this.renderCwd = function() {
		this.cwd.empty();

		var num  = 0, 
			size = 0, 
			vm   = this.fm.viewMode(),
			container = vm == 'icons' 
				? this.cwd 
				: $('<table />').append(
					$('<tr/>')
						.append($('<th/>').text(this.fm.i18n('Name')).attr('colspan', 2))
						.append($('<th/>').text(this.fm.i18n('Permissions')))
						.append($('<th/>').text(this.fm.i18n('Modified')))
						.append($('<th/>').text(this.fm.i18n('Size')))
						.append($('<th/>').text(this.fm.i18n('Kind')))
					).appendTo(this.cwd);
				

		for (var hash in fm.cdc) {

			num++;
			size += fm.cdc[hash].size;
			render(fm.cdc[hash]).attr('key', hash).appendTo(container);

		}
		
		this.pth.text(fm.cwd.rel);
		this.nfo.text(fm.i18n('items')+': '+num+', '+this.formatSize(size));
		
		function render(f) {
			var el, p, n, 
				c=f.type == 'link' && !f.link ? 'broken' : f.mime.replace('/' , ' ').replace('.', '-');

			if (vm == 'icons') {
				n = f.name;
				if (n.length > 24) {
					n = n.substr(0, 12)+' '+n.substr(12, 7)+'..'+n.substr(n.length-3);
				} else if (n.length > 14) {
					n = n.substr(0, 14)+' '+n.substr(14);
				} 
				
				el = $('<div />').addClass(c).append('<p />').append($('<label />').text(n).attr('title', f.name));
				
				f.type == 'link' && el.append('<em />');
				if (!f.read) {
					el.append('<em class="noaccess" />');
				} else if (!f.write) {
					el.append('<em class="ro" />');
				}
			} else {
				p  = $('<p />');
				el = $('<tr />')
						.addClass(c)
						.append($('<td />').addClass('icon').append(p))
						.append($('<td />').text(f.name))
						.append($('<td />').text(self.formatPermissions(f.read, f.write)))
						.append($('<td />').text(self.formatDate(f.date)))
						.append($('<td />').text(self.formatSize(f.size)))
						.append($('<td />').text(self.mimeToKind(f.type == 'link' ? 'symlink' : f.mime)));
				f.type == 'link' && p.append('<em/>');
				if (!f.read) {
					p.append('<em class="noaccess" />');
				} else if (!f.write) {
					p.append('<em class="ro" />');
				}
			}
			return el;
		}
		
		
		
	}

	this.formatDate = function(d) {
		return d.replace(/([a-z]+)\s/i, function(a1, a2) { return self.fm.i18n(a2)+' '; });
	}

	this.formatSize = function(s) {
		var n = 1, u = '';
		if (s > 1073741824) {
			n = 1073741824;
			u = 'Gb';
		} else if (s > 1048576) {
            n = 1048576;
            u = 'Mb';
        } else if (s > 1024) {
            n = 1024;
            u = 'Kb';
        }
        return parseInt(s/n)+' '+u;
	}

	this.formatPermissions = function(r, w) {
		var p = [];
		r && p.push(self.fm.i18n('read'));
		w && p.push(self.fm.i18n('write'));
		return p.join('/');
	}
	
	this.mimeToKind = function(m) {
		return this.fm.i18n(this.kinds[m]||'unknown');
	}
	
}