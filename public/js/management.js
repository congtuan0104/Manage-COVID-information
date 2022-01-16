let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebarBtn");
sidebarBtn.onclick = function () {
    sidebar.classList.toggle("active");
    if (sidebar.classList.contains("active")) {
        sidebarBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else
        sidebarBtn.classList.replace("bx-menu-alt-right", "bx-menu");
}

$(document).ready(function () {
    $('#list').click(function (event) { event.preventDefault(); $('#products .item').addClass('list-group-item'); });
    $('#grid').click(function (event) { event.preventDefault(); $('#products .item').removeClass('list-group-item'); $('#products .item').addClass('grid-group-item'); });
});




$(document).ready(function () {
    document.getElementById('pro-image').addEventListener('change', readImage, false);

    $(".preview-images-zone").sortable();

    $(document).on('click', '.image-cancel', function () {
        let no = $(this).data('no');
        $(".preview-image.preview-show-" + no).remove();
    });
});



var num = 4;
function readImage() {
    if (window.File && window.FileList && window.FileReader) {
        var files = event.target.files; //FileList object
        var output = $(".preview-images-zone");

        for (let i = 0; i < files.length; i++) {
            var file = files[i];
            if (!file.type.match('image')) continue;

            var picReader = new FileReader();

            picReader.addEventListener('load', function (event) {
                var picFile = event.target;
                var html = '<div class="preview-image preview-show-' + num + '">' +
                    '<div class="image-cancel" data-no="' + num + '">x</div>' +
                    '<div class="image-zone"><img id="pro-img-' + num + '" src="' + picFile.result + '"></div>' +
                    '<div class="tools-edit-image"><a href="javascript:void(0)" data-no="' + num + '" class="btn btn-light btn-edit-image">edit</a></div>' +
                    '</div>';

                output.append(html);
                num = num + 1;
            });

            picReader.readAsDataURL(file);
        }
        $("#pro-image").val('');
    } else {
        console.log('Browser not support');
    }
}

// $("#addRow").click(function () {
//     var html = '';
//     html += '<div id="inputFormRow">';
//     html += '<div class="input-group mb-3">';
//     html += '<input type="text" name="title[]" class="form-control m-input" placeholder="Enter title" autocomplete="off">';
//     html += '<div class="input-group-append">';
//     html += '<button id="removeRow" type="button" class="btn btn-danger">Remove</button>';
//     html += '</div>';
//     html += '</div>';

//     $('#newRow').append(html);
// });

// // remove row
// $(document).on('click', '#removeRow', function () {
//     $(this).closest('#inputFormRow').remove();
// });

let money = document.querySelectorAll(".money");
for (let i = 0, len = money.length; i < len; i++) {
    let num = Number(money[i].innerHTML)
        .toLocaleString('en');
    money[i].innerHTML = num;
    money[i].classList.add("currSign");
}