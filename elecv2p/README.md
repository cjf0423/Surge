第一章、安装docker



首先运行如下命令

curl -sSL https://get.daocloud.io/docker | sh


如果您的机器配置比较完整，那么将启动一键安装，代码会跑起来不会报错，请安装完成后直接跳到第二章。









     但是，如果您是新机器，一些配置没有搞过，那么上面的命令会出现报错的情况。



      我专门重装了我的vps，从最纯净的系统开始演示，可能遇到的坑我都会遇到。



     因此，请遇到报错的同学按我下面的步骤走，保证拉你出坑。

    

     下面请看出坑攻略：



#1-1 如果输入第一条命令时，提示：-bash: curl：未找到命令







那么运行如下命令：

apt-get update


会跑一阵代码，耐心等待。







完成后运行如下命令



sudo apt-get install curl


代码跑起来后，询问【y/n】时，果断y并回车









完成后，重新运行最开始的安装命令



curl -sSL https://get.daocloud.io/docker | sh


这次代码跑起来了，请耐心等待









完成后进入第二章












第二章、安装docker-compose



共需要输入以下2条命令



sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose


还是老样子，如果您的机器配置很全，那么这里也是直接傻瓜安装的，完成后直接跳到第三章。



如果不是，请继续看我下面的爬坑攻略吧！



#1-1 如果输入第一条命令时，提示：sudo: 无法解析主机：你的vps名称: 未知的名称或服务，







那么，输入命令



sudo vim /etc/hosts


在出现的页面中找到如下一行



127.0.1.1   XXXXXXX

（注意前面，是127.0.1.1哦，不是127.0.0.1）











将后面的地址修改未你自己的机器名称，



方法是英文输入法模式下，按键盘上的“i”键，



进入编辑模式（此时左下角会显示“插入”两个字），



然后移动光标删除默认的示例名称，更换成为你的主机名。



主机名就是输入命令这里，@后面的部分：













此时要保存设置，方法是按esc键，然后输入命令



:wq






然后回车，此时又退回了初始页面。



重新运行第一条安装命令即可,可以看到已不报错。



sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose






跑完第一条命令后继续跑第二条



sudo chmod +x /usr/local/bin/docker-compose
直接完工







此时docker compose已配置完成。














第三章、安装v2p



运行如下命令，



mkdir /elecv2p && cd /elecv2p
机器会自动新建一个目录存放v2p，并将当前位置移动到这个目录里







在这个目录中新建一个文件，可以用代码命令，也可以在shell工具中直接创建。我直接创建了一个文件。









将创建的文件命名为docker-compose.yaml









然后再shell工具中双击打开这个文件，因为我们是新创建的，这里当然是个空白文件。



把如下代码粘贴进入，代码中的内容可以根据自己的喜好自定义。



比如container_name可以修改成自己喜欢的容器名称，ports:后面的端口映射可以根据实际情况调整，volumes下面的目录分支可以自行调整，等等。



当然你也可以直接照搬照抄，复制粘贴。





version: '3.7'
services:
  elecv2p:
    image: elecv2/elecv2p
    container_name: sngxpro
    restart: always
    environment:
      - TZ=Asia/Shanghai
    ports:
      - "8100:80"
      - "8101:8001"
      - "8102:8002"
    volumes:
      - "/elecv2p/JSFile:/usr/local/app/script/JSFile"
      - "/elecv2p/Lists:/usr/local/app/script/Lists"
      - "/elecv2p/Store:/usr/local/app/script/Store"
      - "/elecv2p/Shell:/usr/local/app/script/Shell"
      - "/elecv2p/rootCA:/usr/local/app/rootCA"
      - "/elecv2p/efss:/usr/local/app/efss"


粘贴后，选择保存即可。





这里注意的是，作者提醒：部分用户反映，在某些设备上需要调整 version 的版本才能启动。如果启动出现问题，可以尝试把文件开头的 version: '3.7' 更改为 version: '3.3'。





保存上述文档后，运行如下命令，启动容器



docker-compose up -d
可以看到代码跑起来了，这里是在拉取项目。请耐心等待。







完成后，v2p就已经完全安装成功啦！






















第四章：v2P的基本配置



V2p安装后，怎么使用呢？



方法是记好下面3个地址：





#登录你的v2p控制台地址：
你机器的ip地址:8100   , 示例 ：127.0.0.1:8100


#查看你的v2p抓包记录控制台地址：
你机器的ip地址:8101   , 示例 ：127.0.0.1:8101


#为你的v2p安装证书地址：
你机器的ip地址:8102   , 示例 ：127.0.0.1:8102


注意：这里ip地址后面的端口号，来源于我们粘贴进自己创建的docker-compose.yaml 文件中的设置（下图位置），如果您粘贴时自定义了，这里也要对应调整。











#4-1 访问自己的v2p控制面板



我们使用浏览器，访问

自己的ip:8100 


可以看到顺利进入了控制台。这个主页也就是v2p的webUI







v2p各个功能的使用我们有时间再聊，今天我们先讲一讲速成教学，也就是怎么马上用起来签到。所以我们的教程也按这个初级目标来讲述。





#4-2  配置证书



点击mitm







在出现的页面中选择最底部，填写一个喜欢的名称，然后点生成









耐心等待一会，会提示已生成







然后我们点左上角的启用证书，并确定







确认启用成功







至此，v2p的基础设置已经全部完成，下一章我们开始准备干点正事了。
















第五章、 在v2p中添加js定时脚本（task任务）



不忘初心，方得始终，我们v2p干啥用的？



那还是跑脚本用的，233333。



这里讲一下怎么添加定时脚本。



在v2p首页点击task







点击任务列表下面的加号，呼出定时脚本模板







我们选取自己想跑的脚本，添加进去。



我用野比大佬的京东多合一脚本举例，



更多脚本大家可以查看我的task多网合一订阅仓库，目前有240多个脚本可供使用。



公众号少年歌行pro全网合一task订阅仓库地址：

https://raw.githubusercontent.com/sngxpro/QuanX/master/task/AllinOne.json


言归正传，野比的脚本添加格式如下：



名称：京东多合一（任意你喜欢的名字均可）

时间：cron定时  0 9 * * *  （可在我上述的仓库中直接查询cron定时推荐，或自定义）

任务列表：运行js  https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js





任务列表中使用了远程地址，

好处是可以实时同步脚本作者的更新。



缺点是需要你的机器可以科学上网，并且现在大量引用脚本会让脚本作者有被GitHub封仓库的困扰。



解决办法我们上文已经说过，那就是把这个js脚本下载下来，用shell工具粘贴到/elecv2p/JSFile目录下。对，和上文说的不能科学上网的一样。此时写法相应调整为



名称：京东多合一（任意你喜欢的名字均可）

时间：cron定时  0 9 * * *  （可在我上述的仓库中直接查询cron定时推荐，或自定义）

任务列表：运行js  JD_DailyBonus.js



我还是以远程这一种来举例，大家举一反三即可。







先点击保存当前任务列表，然后点击绿色的播放按钮将这条task激活。







此时定时脚本已添加完成，但是！！！



这是脚本到点运行会提示没有cookie，并不能顺利得完成脚本功能。



下面我们来讲一下cookie的获取。














第六章、在v2p中配置js脚本运行所需的cookie



v2p有3种常用的方式可以获取cookie：



1、手动把抓包工具获取的cookie一个个的粘贴进v2p。因为麻烦不推荐。



2、配置mitm和rewrite，像圈x一样，用v2p挂代理的方式去抓包。因为难度大不推荐（其实是要说清又得脱稿，我太累了……）。



3、利用配置好的boxjs和手机圈x的boxjs同步cookie。又方便又简单，强烈推荐。



篇幅关系，今天只讲第3种，其他的我们有机会再谈。



#6-1 配置boxjs 的 v2p版



说明：v2p版boxjs由elecv2p修改于chavly的原版boxjs，一并感谢2位大佬。



这里我们点开控制台的JSMANAGE  页面







可以看到这里有一个js文件推送功能。







#6-1-1：如果您的机器能够访问外网（科学上网，或者本身是海外机器），



那么在这里直接输入远程js链接



https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/JSTEST/boxjs.ev.js


并点击开始推送，如图，会提示已下载文件。保存即可。







#6-1-2：如果您的机器不能够访问外网（墙内机器且不能科学上网），



请将boxjs.ev.js文件下载到本地，附2个下载地址



海外实时同步的下载链接（需要在其他能科学上网的设备上先下载，再转移）：
https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/JSTEST/boxjs.ev.js
国内2月24日下载分流（直接就能下载，但不能同步更新，因此仅保留3天）
https://ws28.cn/f/4sbvnwq2r8u


下载后，用shell工具，把这个文件粘贴到/elecv2p/JSFile 目录中即可，和windows操作一样







然后我们打开  RULES







在modify 规则集下点一下加号，呼出规则模板







按如下格式修改：



匹配方式：host

配备内容：一个任意的网址格式，啥都行，比如我设置为boxjs.av

（但是这里不建议填写为boxjs.net 、boxjs.com、boxjs.cn，以防和手机圈x上的boxjs混淆。）

修改方式：JS

修改内容：boxjs.ev.js

修改时间：网络请求前











填好后保存即可。



再打开mitm







点击MITM host下的加号，添加进去自己修改后的网址，如图我的示例。







点击保存并确定。至此基本配置都完事了。
















第七章、使用手机连接v2p版boxjs（ios为例）



今天只做ios的讨论，其他设备有空再讲。



第六章中我们配置好了v2p的boxjs，v2p自带了一个代理工作（使用了ANYPROXY 服务）



所以只要我们的手机连接到v2p的代理服务器，



就可以自由访问了。



V2p的代理服务器地址就是你的ip地址；

端口就是8101（老话重提，如果你在填写yaml文件时，端口做了自定义，这里需要对应修改）



我们仍然假定ip地址是127.0.0.1 ，那么：



代理服务器地址就是127.0.0.1:8101



#7-1  苹果手机连接代理服务器



主要可以用2种方法：



#7-1-1 如果你有wifi可以连，那么直接使用ios手机wifi功能自带的内置代理功能，就可以进行简单配置



首先打开wifi页面，点击已连接wifi后面的小叹号









出现的页面，拉倒最下方，将配置代理改成手动









如图填写配置并储存。图例的你的ip请换成你的ip地址啊，不要傻傻的打上汉字







存储后，使用这个wifi时就可以自由连接你的v2p了



但是！但是！但是！

必须是直接连着这个wifi才行，不能开着任何代理工具，

如小火箭、圈x、loon等！

直连模式也不行！

切记切记。



具体如何连接自己的v2p呢，我先讲完第二种代理方法再一起说。



#7-1-2 如果你没有wifi可联，或者经常需要出去不能总用一个wifi，那么可以借助支持http的代理软件来配置，比如小火箭、loon。（圈x不行）



这里我用小火箭举例，loon的大同小异，自行参照。

首先点击小火箭右上角的加号，创建一个节点







类型选择http，地址就是你的ip地址，端口就是你设置的端口，如果没修改最开始的yaml文件则为8101



















当你开启小火箭并使用这个节点时，ios手机就可以自由的链接你的boxjs了



#7-2 手机连接boxjs v2p版



当你使用上文方法挂好代理后，使用手机浏览器，直接访问你设置好的boxjs v2p的域名



我设置的是boxjs.av，详见第6章







可以看到，这个根本不真是存在的域名真的访问到了boxjs！






注意！！这里访问的是你搭建的v2p的boxjs，

可不是你之前圈x一直在使用的boxjs！

因此这个boxjs里面是空的！啥也没有！







点击一下左上角的图标，切换成你在使用的代理工具，我还是用圈x来举例






然后添加boxjs订阅。你圈x上的boxjs使用什么订阅，这里就加什么订阅，一样就可以，方便我们下一章将你手机上的cookie同步到v2p。



这里我也是以野比的boxjs订阅为例，方便和上面的task对应讲解。点击添加订阅，把下方地址粘贴进去。



https://raw.githubusercontent.com/NobyDa/Script/master/NobyDa_BoxJs.json








此时已经可以准备进行同步














第八章、利用boxjs，同步手机上已获取的cookie到v2p



我们知道，现在我们的v2p只是一个空架子，实际上没有任何cookie。



但是我们之前在手机圈x的boxjs上是保存了很多cookie的。



如果您此前手机上也没有cookie，请现在先用手机圈x去获取cookie。



可以使用我的获取cookie订阅，只要写入圈x配置文件的[rewrite remote]标签下，基本全网脚本的cookie都能获取（部分cookie需要访问特定页面，请按脚本说明访问）

#公众号少年歌行pro全网Cookie获取订阅地址（仅支持圈x）：
https://raw.githubusercontent.com/sngxpro/QuanX/master/rewrite/cookie.conf


我们只要一倒手，

V2p就可以获得满满的cookie啦！







方法如下：



#8-1  备份手机boxjs中的已有配置



关闭连接v2p的那个代理，

我们用正常的圈x代理方式，访问boxjs手机版，

Boxjs.net 或 boxjs.com



这个不用详细讲了吧？下图已经是我的手机boxjs，可以看到版本号是不同的







点击右下角我的，在出现页面中点击“备份”







然后点击下方新出现的最新的一个备份







选择复制







#8-2 将配置同步到v2p



复制好后，直接关闭圈x代理，打开v2p代理（wifi或小火箭节点方法），访问v2p版boxjs。看版本号就是回来了。记得切换左上角为圈x模式（或对应您的实际情况调整）。







点击我的，选择导入







在弹出的对话框里粘贴我们刚才复制的圈x版boxjs备份资料，并点击导入







然后点击最新导入的备份（首次操作应该只有1个，下图是我多次备份过了，总之选最新的即可）







点开后，点击还原配置按钮







等待完事，就可以了。



我们回到v2p控制台，进入jsmanage，







点击一下刷新网页，你会发现，下面刷的一声多出了一大堆cookie（我备份的比较多，实际如果只有京东cookie不会有这么多）









保存之后，我们再回到task页面







把之前我们演示保存好的京东多合一脚本运行一下，看看能不能正常跑了


















第九章、建议



配置完成后，更新并重启一次v2p比较保险。推荐设置之后直接在shell工具中运行一次命令：



cd /elecv2p
docker-compose pull elecv2p && docker-compose up -d
