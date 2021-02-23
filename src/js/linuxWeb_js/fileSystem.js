fileSystem = {
    fileRootPath = 'fileSystem.root'
    ,
    isFile: function (file) {
        return file['\\0'].slice(3) == '1'
    },
    isDir: function (file) {
        return file['\\0'].slice(3) == '0'
    },
    isEmptyDir: function (file) {
        if (isDefined(file))
            return Object.entries(file).length <= 1
    },
    setPermissions: function (file, val) {
        file['\\0'] = val + this.getType(file);

    },
    setType: function (file, val) {
        if (!(val.toString() === '0' || val.toString() === '1')) {
            throw `Error 4: Bad type value :: ${val}`
        }
        file['\\0'] = this.getPermissions(file) + val
    },
    getPermissions: function (file) {
        return file['\\0'].slice(0, 3)
    },
    getType: function (file) {
        return file['\\0'].slice(3)
    },
    getDir: function (path, returnPath = false, throwError = true) { // returnPath = 'array' or 'string'
        path = path.trim();
        if (!path.startsWith('/')) {
            throw "Error 0: Bad Path Start :: Paths must start with '/'!"
        }
        if (path.includes('\\0')) {
            throw "Error 1: Bad character in path :: '\\0' - Cannot be used in a path!" // '\0' - permissions and type string
        }

        path = path.slice(1); // Remove the '/' from the beginning
        if (!isTextEmpty(path));
        objPath = path.split('/').map(x => { return isTextEmpty(x) ? '' : `['${x}']` }).join('');

        try {
            retObj = eval(this.fileRootPath + objPath)
        } catch (error) {
            retObj = null;
        }

        console.log(retObj, throwError);
        if (!isDefined(retObj) && throwError) throw `/${path}: Path not found.`;
        if (returnPath == 'array') return [retObj, path.split('/')];
        if (returnPath == 'string') return [retObj, objPath];
        else return retObj;
    },

    write: function (path, type = null, text = null, permissions = null) {
        [file, filePath] = this.getDir(path, "array");
        console.log(file, filePath, true);

        if (!isDefined(file)) {
            objPath = this.fileRootPath;
            filePath.forEach(x => {
                nextPath = isTextEmpty(x) ? '' : `['${x}']`;
                objPath += nextPath;
                if (!isDefined(eval(objPath))) {
                    eval(objPath + " = { '\\\\0': '7770' }");
                }
                console.log(objPath);
            });
            file = eval(objPath);
        }
        if (isDefined(file)) {
            if (type != null && type != this.getType(file)) this.setType(file, type);
            if (permissions != null && permissions != this.getPermissions(file)) this.setPermissions(file, permissions);
            if (this.isFile(file) && isDefined(text)) file.data = text;
        }
    },

    read: function (path) {
        file = this.getDir(path);
        if (!this.isFile(file)) {
            throw `Error 2: ${path} is not a file!`;
        }
        return file.data
    },
    remove: function (path, force = false) {
        [file, filePath] = this.getDir(path, "string");

        if (!this.isEmptyDir(file) && !force)
            throw `Error 10: Directory is not empty  (${path}) - try remove(*path*, true) to force remove a directory`;

        console.log(file, filePath);
        eval('delete ' + this.fileRootPath + filePath)
    },
    //Actual file system
    root: {
        '\\0': "7770", // '777' - permission ,  '0' - type =   0-directory, 1-file
        dev: {
            '\\0': "7770",
        },
        etc: {
            '\\0': "7770",
        },
        boot: {
            '\\0': "7770",
        },
        home: {
            '\\0': "7770",
        },
        root: {
            '\\0': "7770",
            "test.txt": {
                '\\0': "7771",
                data: `Hello, World!`
            }
        },
        var: {
            '\\0': "7770",
        },



    }




}