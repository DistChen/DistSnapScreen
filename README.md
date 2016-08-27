最近因为产品需要，用js 写了一个能网页截图并涂鸦的js库(类似QQ 截图工具)。这个库与html2canvas 等类似的库有巨大的差异:html2canvas 只能做到截取“网页”的部分元素类型，而网页之外的内容(浏览器窗口之外)，或者跨域的iframe，java applet 等元素是无法截取的。而我们的需求是要能截取桌面上的任何东西，不限窗口和元素类型，换言之：要做一个类似“QQ 截图工具“的js库来在网页上使用。

所以就只能自己琢磨了,我们的产品用的是dojo，所以我最开始写的是一个dojo的widget，后来又单独写成了一个jquery的插件，如下使用即可：

![这里写图片描述](http://imglf2.ph.126.net/3qh9GeT1jt0PtCMN8mH0cQ==/6631831926279972386.png)

初始化的参数就是图片上传的相关地址，demo 效果如下：

![这里写图片描述](http://imglf2.ph.126.net/3tVZN3SgwkOVwByBs4mHpg==/4874865121752669899.png)

当点击截图后，鼠标状态会变成截图状态，然后拉取桌面的任意一个区域即可：

![这里写图片描述](http://imglf1.ph.126.net/d9swzoqZZoeF1eMQJbzKpQ==/4863324647708399071.png)

截取到的区域会“立刻绘制到页面的canvas“（严格来说，图片此时还没有绘制到画布上，后面有介绍） 中，在这里我也添加了一些操作到画布上，比如添加文字、矩形、圆，设置颜色等，如下所示：

![这里写图片描述](http://imglf0.ph.126.net/FpfhvdyGBHCkhNCVmgdXTQ==/6631739567303236395.png)

各种操作完成之后，点击确定即可：

![这里写图片描述](http://imglf0.ph.126.net/aBRyaz96OXRF5LfxuFHsvA==/6631666999535804970.png)

图片就会插入到编辑框中，查看dom:

![这里写图片描述](http://imglf0.ph.126.net/1pPJCNZJU4vKxRoGX7v51Q==/6631790144838114030.png)

如上就是完整的过程，当然，也可以只截图不涂鸦。这里说下相关的注意事项：

> 前提：
> >1. 安装一个截图插件(如果你会C++，可以查看我的这边文章[《兼容各大浏览器的插件开发》](http://blog.csdn.net/DistChen/article/details/52335057) 了解如何开发浏览器插件；
>  
>  >2. 启动图片上传的服务器(允许跨域)。
>
>流程
 >>1.  点击截图，调用插件的方法来截图，完成后，插件会把图片上传到服务器中，并将上传后的地址返回给前端；
 >>2. 前端拿到地址后，将此地址当作canvas画布的背景(因为橡皮擦的功能设计，这个时候并不会将图片绘制到canvas上，而是当点击确定后，再把图片绘制到canvas上)，img 的crossOrigin 设为anonymous(如果没跨域就不需要)；
 >>3. 各种操作……. (注意，点击橡皮擦时，要将canvas.context.globalCompositeOperation设为destination-out)；
 >>4. 点击确定，绘制图片到canvas上，要将canvas.context.globalCompositeOperation设为destination-over；
 >>5. 然后通过canvas.toDataURL("image/png")即可取到涂鸦后的图片了。
 >
>涂鸦状态中的dom 结构如下所示:

![这里写图片描述](http://imglf0.ph.126.net/NteWyr7aaSBrjRTA9MgE2Q==/6631586735186975823.png)

可以看到在canvas的下面有一个img，这也就是为什么图片还没绘制到画布上也能看到图片的原因。不足之处，请多多指教。
