fileSystem = {
    fileRootPath: 'fileSystem.root',
    //Check if a file obj is a file
    isFile: function (file) {
        return file['\\0'].slice(3) == '1'
    },
    //Check if a file obj is a dir
    isDir: function (file) {
        return file['\\0'].slice(3) == '0'
    },
    isEmptyDir: function (file) {
        if (isDefined(file))
            return Object.entries(file).length <= 1
    },
    //Change the permission value of the file/dir
    setPermissions: function (file, val) {
        file['\\0'] = val + this.getType(file);

    },
    setType: function (file, val) {
        //If val is not either 1 or 0. throw error.
        if (!(val.toString() === '0' || val.toString() === '1')) {
            throw `Error 4: Bad type value :: ${val}`
        }
        //Sets the file to the new value. '777' + 0 || 1
        file['\\0'] = this.getPermissions(file) + val
    },
    getPermissions: function (file) {
        return file['\\0'].slice(0, 3) // eg. Returns '777' from '7770'
    },
    getType: function (file) {
        return file['\\0'].slice(3)
    },
    getDir: function (path, returnPath = false, throwError = true, expected = null) { // returnPath = 'array' or 'string'
        path = path.trim();
        if (!path.startsWith('/')) {
            throw "Error 0: Bad Path Start :: Paths must start with '/'!"
        }
        if (path.includes('\\0')) {
            throw "Error 1: Bad character in path :: '\\0' - Cannot be used in a path!" // '\0' - permissions and type string
        }
        path = path.slice(1); // Remove the '/' from the beginning

        //Gets the fileSystem Object from the stringy path
        const objPath = path.split('/').map(x => { return isTextEmpty(x) ? '' : `['${x}']` }).join('');

        //Check if the path exists
        try {
            retObj = eval(this.fileRootPath + objPath)
        } catch (error) {
            retObj = null;
        }
        //Check if location is the expected type (dir or file)
        if (isDefined(retObj) && expected != null && fileSystem.isFile(retObj) != expected) {
            if (expected == 0)
                throw `Error 3: ${path} is not a directory`;
            else
                throw `Error 2: ${path} is not a file!`;
        }
        //Check options and return what needs to be returned
        if (!isDefined(retObj) && throwError) throw `/${path}: Path not found.`;
        if (returnPath == 'array') return [retObj, path.split('/')];
        if (returnPath == 'string') return [retObj, objPath];
        else return retObj;
    },

    write: function (path, type = null, text = null, permissions = null) {
        let [file, filePath] = this.getDir(path, "array", false);

        // First: Check if it doesn't exists.if true create it.
        if (!isDefined(file)) {
            let objPath = this.fileRootPath;
            filePath.forEach(x => {
                const nextPath = isTextEmpty(x) ? '' : `['${x}']`;
                objPath += nextPath;
                if (!isDefined(eval(objPath))) {
                    eval(objPath + " = { '\\\\0': '7771' }");
                }
            });
            file = eval(objPath);
        }

        // Second: Check if it exists then write to it
        if (isDefined(file)) {
            if (type != null && type != this.getType(file)) this.setType(file, type);
            if (permissions != null && permissions != this.getPermissions(file)) this.setPermissions(file, permissions);
            if (this.isFile(file) && isDefined(text)) file.data = text;
        }
    },
    //Return the Data of the dir obj
    read: function (path) {
        return this.getDir(path, false, true, 1).data
    },
    // Remove file/dir.
    remove: function (path, force = false) { //Works for both Dir and files
        const [file, filePath] = this.getDir(path, "string");

        if (this.isDir(file) && !this.isEmptyDir(file) && !force)
            throw `Error 10: Directory is not empty  (${path}) - try remove(*path*, true) to force remove a directory`;

        eval('delete ' + this.fileRootPath + filePath)
    },
    //Remove directory
    removeDir: function (path, force = false) {
        try {
            this.getDir(path, "string", true, 0);
        } catch (error) {
            throw error
        }
        this.remove(path, force)
    },
    //Remove file
    removeFile: function (path, force = false) {
        try {
            this.getDir(path, "string", true, 1);
        } catch (error) {
            throw error
        }
        this.remove(path, force)
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