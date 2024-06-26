var renderFlag = false;
var pdf = new PDFAnnotate('pdf-container', 'sample.pdf', {
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
  pageImageCompression: 'MEDIUM', // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
});

function changeActiveTool(event) {
  var element = $(event.target).hasClass('tool-button')
    ? $(event.target)
    : $(event.target).parents('.tool-button').first();
  $('.tool-button.active').removeClass('active');
  $(element).addClass('active');
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
    $('.tool-button').first().find('i').click();
  });
}

function addImage(event) {
  event.preventDefault();
  pdf.addImageToCanvas();
}

function enableRectangle(event) {
  event.preventDefault();
  changeActiveTool(event);
  pdf.setColor('rgba(255, 0, 0, 0.3)');
  pdf.setBorderColor('blue');
  pdf.enableRectangle();
}

function deleteSelectedObject(event) {
  event.preventDefault();
  pdf.deleteSelectedObject();
}

function savePDF() {
  // pdf.savePdf();
  pdf.savePdf('output.pdf'); // save with given file name
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
    $('#dataModal .modal-body pre')
      .first()
      .text(JSON.stringify(JSON.parse(string), null, 4));
    PR.prettyPrint();
    $('#dataModal').modal('show');
  });
}

$(function () {
  $('.color-tool').click(function () {
    $('.color-tool.active').removeClass('active');
    $(this).addClass('active');
    color = $(this).get(0).style.backgroundColor;
    pdf.setColor(color);
  });

  $('#brush-size').change(function () {
    var width = $(this).val();
    pdf.setBrushSize(width);
  });

  $('#font-size').change(function () {
    var font_size = $(this).val();
    pdf.setFontSize(font_size);
  });
});

let list = $('#bz-list')[0];
let lis;
let dels;
let ipts;
function renderList() {
  list.innerHTML = '';
  console.log(sampleOutput);
  let domEle = '';
  sampleOutput.pages.map((item, index) => {
    item.objects.length &&
      item.objects.forEach(($item, $index) => {
        $item.commitInfo.page = index;
        $item.commitInfo.num = $index;
        domEle += createDomElement($item);
      });
  });
  if (domEle == '') {
    list.style.opacity = 0;
  } else {
    list.style.opacity = 1;
  }
  list.insertAdjacentHTML('beforeend', domEle);

  lis = $('#bz-list li');
  dels = $('#bz-list .header .fa-trash');
  ipts = $('#bz-list .commit input');

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
    description: '这是一个评论',
    user: '评论人',
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
    lis[i].addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const pageNum = lis[i].getAttribute('data').split(',');
      const canvas = pdf.fabricObjects[pageNum[0]];
      const eleSelect = canvas.getObjects()[pageNum[1]];
      document.querySelectorAll('.canvas-container')[pageNum[0]].scrollIntoView();
      document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + eleSelect.top - 60;
      canvas.setActiveObject(eleSelect, 'mouse:down');
      canvas.renderAll();
    });
  }

  for (let index = 0; index < dels.length; index++) {
    dels[index].addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm('确定删除?')) {
        const pageNum = lis[index].getAttribute('data').split(',');
        sampleOutput.pages[pageNum[0]].objects.splice(pageNum[1], 1);
        renderList();
        const canvas = pdf.fabricObjects[pageNum[0]];
        const eleSelect = canvas.getObjects()[pageNum[1]];
        canvas.remove(eleSelect);
      }
    });
  }

  for (let i = 0; i < ipts.length; i++) {
    ipts[i].addEventListener('blur', (e) => {
      const pageNum = lis[i].getAttribute('data').split(',');
      sampleOutput.pages[pageNum[0]].objects[pageNum[1]].commitInfo.description = e.target.value;
    });
  }
}

function saveData() {
  console.log(sampleOutput);
}

renderList();

(function () {
  const body = document.querySelector('body');
  list.addEventListener('scroll', function () {
    body.style.overflow = 'hidden';
  });

  list.addEventListener('mouseleave', function () {
    body.style.overflow = 'scroll';
  });
})();
