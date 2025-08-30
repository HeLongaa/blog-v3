---
title: 服务器挂载数据盘及Docker默认存储位置修改
description: docker使用中产生的数据会让docker的数据目录越来越大，本文记录数据盘挂载及docker数据迁移过程。
date: 2025-05-09 03:55:25
categories: [开发运维]
tags: [Server,Docker]
image: "https://oss.helong.online/bucket-IMG/20db800c4fb951c13af9a880bdb5812ae2c9526808fda15d24b6cd74c1453e54.png"
---

## 挂载数据盘

1. `df -h`查看磁盘情况

若只有一个磁盘/dev/vda1，说明数据盘没有挂载。

2. `fdisk -l`

::pic
---
src: https://oss.helong.online/bucket-IMG/9ca4c0a768586c195b8deff83a81d6c00c22dd4fb4122384fe3233a6b39242d0.png
mirror: true
caption: 磁盘分区查看结果显示
---
::  


如果发现上面输出结果中没有类似 Disk /dev/vdb:的部分，说明没有数据盘，下面的挂载操作没有意义，可以直接跳到下一部分。

3. 对磁盘分区`fdisk  /dev/vdb`

依次输入m 、p、1、回车，回车、wq 即可。

4. 格式化磁盘`mkfs.ext4  /dev/vdb1`

5. 将磁盘挂载到系统中

`mount  /dev/vdb1  /mnt/data`(需要提前创建需要挂载的位置/mnt/data)

6. 配置服务器重启自动挂载

`blkid`查询磁盘UUID

::pic
---
src: https://oss.helong.online/bucket-IMG/29d43b8d42ab64d114be106e49dd572791a14094592c2c5e7e8818f11ec83ec1.png
mirror: true
caption: 磁盘UUID查询结果
---
::  

修改/etc/fstab文件 `vim /etc/fstab`

::pic
---
src: https://oss.helong.online/bucket-IMG/1269f460fd0346eb82a4c670833ae00e05ed9fb04aac8e8d1b26e600b1b7c83f.png
mirror: true
caption: fstab文件编辑配置截图
---
::  

添加`UUID=2b2f2aea-4153-4f32-a0ba-8258c849929f /mnt/data ext4 defaults 0 2`

## Docker数据迁移

1. 停止docker服务

`sudo systemctl stop docker`

2. 创建新文件夹

`mkdir /mnt/data/docker`

3. 移动文件

`sudo rsync -avzh /var/lib/docker/ /mnt/data/docker/`

4. 更新Docker配置

`vim /etc/docker/daemon.json`

如果文件 /etc/docker/daemon.json 不存在，就创建它。添加或更新以下内容：

```
{
    "data-root": "/mnt/data/docker"
}
```

5. 重新启动 Docker 服务

`sudo systemctl start docker`

6. 验证 Docker 是否正常工作，并且新的数据存储位置是否正在使用。可以通过运行容器来测试。

一旦确认一切正常，删除旧的 Docker 数据目录：

`sudo rm -rf /var/lib/docker`

通过`docker info`查看Docker信息

::pic
---
src: https://oss.helong.online/bucket-IMG/45dd4f2688e5a21684de01f148a3b2abde06ca7d30011bea0e9e970d9d7294f5.png
mirror: true
caption: Docker信息查看显示Docker数据目录
---
::  

` Docker Root Dir: /mnt/data/docker`

该行表示docker数据位置。
