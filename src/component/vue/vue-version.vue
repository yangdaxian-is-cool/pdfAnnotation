<template>
  <div class="toolbar">
    <div class="tool">
      <span>pdf</span>
    </div>
    <div class="tool">
      <label for="">线粗细</label>
      <input
        type="number"
        class="form-control text-right"
        value="1"
        id="brush-size"
        max="50"
      />
    </div>
    <div class="tool">
      <label for="">字体大小</label>
      <select id="font-size" class="form-control">
        <option value="10">10</option>
        <option value="12">12</option>
        <option value="16" selected>16</option>
        <option value="18">18</option>
        <option value="24">24</option>
        <option value="32">32</option>
        <option value="48">48</option>
        <option value="64">64</option>
        <option value="72">72</option>
        <option value="108">108</option>
      </select>
    </div>
    <div class="tool">
      <button
        class="color-tool active"
        style="background-color: #212121"
      ></button>
      <button class="color-tool" style="background-color: red"></button>
      <button class="color-tool" style="background-color: blue"></button>
      <button class="color-tool" style="background-color: green"></button>
      <button class="color-tool" style="background-color: yellow"></button>
    </div>
    <div class="tool">
      <button class="tool-button active">
        <i
          class="fa fa-hand-paper-o"
          title="Free Hand"
          @click="enableSelector(event)"
        ></i>
      </button>
    </div>
    <div class="tool">
      <button class="tool-button">
        <i class="fa fa-pencil" title="Pencil" @click="enablePencil(event)"></i>
      </button>
    </div>
    <div class="tool">
      <button class="tool-button">
        <i
          class="fa fa-font"
          title="Add Text"
          @click="enableAddText(event)"
        ></i>
      </button>
    </div>
    <div class="tool">
      <button class="tool-button">
        <i
          class="fa fa-long-arrow-right"
          title="Add Arrow"
          @click="enableAddArrow(event)"
        ></i>
      </button>
    </div>
    <div class="tool">
      <button class="tool-button">
        <i
          class="fa fa-square-o"
          title="Add rectangle"
          @click="enableRectangle(event)"
        ></i>
      </button>
    </div>
    <div class="tool">
      <button class="tool-button">
        <i
          class="fa fa-picture-o"
          title="Add an Image"
          @click="addImage(event)"
        ></i>
      </button>
    </div>
    <div class="tool">
      <button
        class="btn btn-danger btn-sm"
        @click="deleteSelectedObject(event)"
      >
        <i class="fa fa-trash"></i>
      </button>
    </div>
    <div class="tool">
      <button class="btn btn-danger btn-sm" @click="clearPage()">
        Clear Page
      </button>
    </div>
    <div class="tool">
      <button class="btn btn-info btn-sm" @click="showPdfData()">{}</button>
    </div>
    <div class="tool">
      <button class="btn btn-light btn-sm" @click="savePDF()">
        <i class="fa fa-save"></i> 导出PDF
      </button>
      <button class="btn btn-light btn-sm" @click="saveData()">
        <i class="fa fa-save"></i> 保存
      </button>
    </div>
  </div>
  <div>
    <ul id="bz-list"></ul>
  </div>
  <div id="pdf-container"></div>

  <div
    class="modal fade"
    id="dataModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="dataModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="dataModalLabel">PDF annotation data</h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <pre class="prettyprint lang-json linenums"></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick } from "vue";
import { PDFAnnotate } from "./js/pdfannotate.js";
import $ from "jquery";
import { sampleOutput } from "./js/sample_output.js";

var renderFlag = false;
let pdf;
nextTick(() => {
  setTimeout(() => {
    pdf = new PDFAnnotate("pdf-container", "/sample.pdf", {
      onPageUpdated(page, oldData, newData) {
        if (renderFlag) {
          const addData = newData.objects[newData.objects.length - 1];
          addDataToSamepleOutPut(addData, page, newData.objects.length);
        }
      },
      ready() {
        console.log(sampleOutput);
        pdf.loadFromJSON(sampleOutput);
        renderFlag = true;
      },
      scale: 1.5,
      pageImageCompression: "MEDIUM", // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
    });
  }, 1000);
});

function changeActiveTool(event) {
  var element = $(event.target).hasClass("tool-button")
    ? $(event.target)
    : $(event.target).parents(".tool-button").first();
  $(".tool-button.active").removeClass("active");
  $(element).addClass("active");
}

function enableSelector(event) {
  event.preventDefault();
  changeActiveTool(event);
  pdf.enableSelector();
}

function enablePencil(event) {
  event.preventDefault();
  changeActiveTool(event);
  pdf.enablePencil();
}

function enableAddText(event) {
  event.preventDefault();
  changeActiveTool(event);
  pdf.enableAddText();
}

function enableAddArrow(event) {
  event.preventDefault();
  changeActiveTool(event);
  pdf.enableAddArrow(function () {
    $(".tool-button").first().find("i").click();
  });
}

function addImage(event) {
  event.preventDefault();
  pdf.addImageToCanvas();
}

function enableRectangle(event) {
  event.preventDefault();
  changeActiveTool(event);
  pdf.setColor("rgba(255, 0, 0, 0.3)");
  pdf.setBorderColor("blue");
  pdf.enableRectangle();
}

function deleteSelectedObject(event) {
  event.preventDefault();
  pdf.deleteSelectedObject();
}

function savePDF() {
  // pdf.savePdf();
  pdf.savePdf("output.pdf"); // save with given file name
}

function clearPage() {
  pdf.clearActivePage();
  sampleOutput.pages.map((item) => {
    item.objects = [];
  });
  renderList();
}

function showPdfData() {
  pdf.serializePdf(function (string) {
    console.log(JSON.parse(string));
    $("#dataModal .modal-body pre")
      .first()
      .text(JSON.stringify(JSON.parse(string), null, 4));
    PR.prettyPrint();
    $("#dataModal").modal("show");
  });
}

$(function () {
  $(".color-tool").click(function () {
    $(".color-tool.active").removeClass("active");
    $(this).addClass("active");
    color = $(this).get(0).style.backgroundColor;
    pdf.setColor(color);
  });

  $("#brush-size").change(function () {
    var width = $(this).val();
    pdf.setBrushSize(width);
  });

  $("#font-size").change(function () {
    var font_size = $(this).val();
    pdf.setFontSize(font_size);
  });
});

let list;
let lis;
let dels;
let ipts;
function renderList() {
  list.innerHTML = "";
  console.log(sampleOutput);
  let domEle = "";
  sampleOutput.pages.map((item, index) => {
    item.objects.length &&
      item.objects.forEach(($item, $index) => {
        $item.commitInfo.page = index;
        $item.commitInfo.num = $index;
        domEle += createDomElement($item);
      });
  });
  if (domEle == "") {
    list.style.opacity = 0;
  } else {
    list.style.opacity = 1;
  }
  list.insertAdjacentHTML("beforeend", domEle);

  lis = $("#bz-list li");
  dels = $("#bz-list .header .fa-trash");
  ipts = $("#bz-list .commit input");

  addEventListenerFn();
}

function addDataToSamepleOutPut(data, page, num) {
  //获取当前日期函数
  function getNowFormatDate() {
    let date = new Date(),
      year = date.getFullYear(), //获取完整的年份(4位)
      month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
      strDate = date.getDate(); // 获取当前日(1-31)
    if (month < 10) month = `0${month}`; // 如果月份是个位数，在前面补0
    if (strDate < 10) strDate = `0${strDate}`; // 如果日是个位数，在前面补0

    return `${year}-${month}-${strDate}`;
  }
  data.commitInfo = {
    type: data.type,
    page,
    num,
    description: "这是一个评论",
    user: "评论人",
    time: getNowFormatDate(),
  };
  sampleOutput.pages[page - 1].objects.push(data);
  renderList();
}

function createDomElement(data) {
  return `<li data="${data.commitInfo.page},${data.commitInfo.num}">
  <div class="header"><span class="type">类型：<span>${data.type}</span></span><i class="fa fa-trash"></i></div>
  <div class="commit"><input value="${data.commitInfo.description}"></input></div>
  <div class="info">
    <div class="user">${data.commitInfo.user}</div>
    <div class="time">${data.commitInfo.time}</div>
  </div>
</li>`;
}

function addEventListenerFn() {
  for (let i = 0; i < lis.length; i++) {
    lis[i].addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const pageNum = lis[i].getAttribute("data").split(",");
      const canvas = pdf.fabricObjects[pageNum[0]];
      const eleSelect = canvas.getObjects()[pageNum[1]];
      document
        .querySelectorAll(".canvas-container")
        [pageNum[0]].scrollIntoView();
      document.scrollingElement.scrollTop =
        document.scrollingElement.scrollTop + eleSelect.top - 60;
      canvas.setActiveObject(eleSelect, "mouse:down");
      canvas.renderAll();
    });
  }

  for (let index = 0; index < dels.length; index++) {
    dels[index].addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm("确定删除?")) {
        const pageNum = lis[index].getAttribute("data").split(",");
        sampleOutput.pages[pageNum[0]].objects.splice(pageNum[1], 1);
        renderList();
        const canvas = pdf.fabricObjects[pageNum[0]];
        const eleSelect = canvas.getObjects()[pageNum[1]];
        canvas.remove(eleSelect);
      }
    });
  }

  for (let i = 0; i < ipts.length; i++) {
    ipts[i].addEventListener("blur", (e) => {
      const pageNum = lis[i].getAttribute("data").split(",");
      sampleOutput.pages[pageNum[0]].objects[
        pageNum[1]
      ].commitInfo.description = e.target.value;
    });
  }
}

function saveData() {
  console.log(sampleOutput);
}

onMounted(() => {
  list = $("#bz-list")[0];
  renderList();

  const body = document.querySelector("body");
  list.addEventListener("scroll", function () {
    body.style.overflow = "hidden";
  });

  list.addEventListener("mouseleave", function () {
    body.style.overflow = "scroll";
  });
});
</script>

<style>
@import url("./css/styles.css");
@import url("./css/bootstrap.min.css");
@import url("./css/prettify.min.css");
@import url("./css/font-awesome.min.css");
@import url("./css/pdfannotate.css");
</style>
