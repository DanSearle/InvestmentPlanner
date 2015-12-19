import os
import urllib
import json
import platform
import tarfile
import shutil
import urllib2

ACTIVATE_SH = """
export PATH="{0}:$PATH"
"""

def download_node(node_directory, node_version=None):
    node_exe = os.path.join(node_directory, "node")
    if os.path.lexists(node_exe):
        print "Doing nothing as %s exists" % node_exe
        return os.path.realpath(node_exe)

    if not node_version:
        json_file = urllib.urlopen("https://nodejs.org/download/release/index.json").read()
        versions = json.loads(json_file)
        lts_versions = [x["version"] for x in versions if x["lts"]]
        lts_versions.sort(reverse=True)
        node_version = lts_versions[0]

    arch_mappings = {
        "x86_64": "x64",
        "x86": "x86"
    }
    arch = arch_mappings[platform.processor()]
    download_url = "https://nodejs.org/download/release/{0}/node-{0}-linux-{1}.tar.gz".format(node_version,arch)

    if not os.path.exists(node_directory):
        os.mkdir(node_directory)

    node_extract_path = os.path.join(node_directory, "node-{0}-linux-{1}".format(node_version, arch), "bin", "node")
    node_download_file = os.path.join(node_directory, "node-{0}-linux-{1}.tar.gz".format(node_version, arch))

    url_downloader = urllib.URLopener()
    url_downloader.retrieve(download_url, node_download_file)

    tar = tarfile.open(node_download_file)
    tar.extractall(path=node_directory)

    os.symlink(os.path.abspath(node_extract_path), node_exe)
    return os.path.realpath(node_exe)

"""def download_npm(node_directory, npm_url=None):
    npm_exe = os.path.join(node_directory, "npm")
    if os.path.lexists(npm_exe):
        print "Doing nothing as %s exists" % npm_exe
        return

    if not npm_url:
        npm_url = json.loads(urllib.urlopen("https://api.github.com/repos/npm/npm/releases/latest").read())["tarball_url"]

    node_modules_dir = os.path.join(node_directory, "node_modules")
    new_dir = os.path.join(node_modules_dir, "npm")

    if os.path.exists(new_dir):
        shutil.rmtree(new_dir)

    npm_zip_file = os.path.join(node_directory, "npm.tar.gz")

    print "Downloading npm from %s to %s" % (npm_url, npm_zip_file)
    url_downloader = urllib2.urlopen(npm_url)
    with open(npm_zip_file, "wb") as npm_file:
        npm_file.write(url_downloader.read())

    tar = tarfile.open(npm_zip_file)
    tar.extractall(path=node_directory)

    unzip_directory = tar.getmembers()[0].path

    if not os.path.exists(node_modules_dir):
        os.mkdir(node_modules_dir)

    original_dir = os.path.join(node_directory, unzip_directory)
    new_dir = os.path.join(node_modules_dir, "npm")

    print "Moving npm from %s to %s" % (original_dir, new_dir)
    shutil.move(original_dir, new_dir)

    print "Linking npm within %s" % node_directory

    print "Removing npm zip file %s" % npm_zip_file
    os.remove(npm_zip_file)

    new_path = os.path.abspath(os.path.join(new_dir, "bin", "npm"))
    print "Symlinking npm file %s" % npm_exe
    os.symlink(new_path, npm_exe)"""

node_directory = "bin"
node_bin = download_node(node_directory)
#download_npm(node_directory)

with open(os.path.join(node_directory, "activate"), "w") as activate_script:
    activate_script.write(ACTIVATE_SH.format(os.path.dirname(os.path.abspath(node_bin))))
