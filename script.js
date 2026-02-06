(() => {
    const PER_PAGES = 4;
    const form = document.getElementById("calc-form");
    const input = document.getElementById("pages-input");
    const result = document.getElementById("client-result");

    const isPositiveIntegerString = (value) => /^[0-9]+$/.test(value);

    const parsePages = (value) => {
        const trimmed = value.trim();
        if (trimmed === "") {
            return { error: "ページ数を入力してください。" };
        }

        if (!isPositiveIntegerString(trimmed)) {
            return { error: "正の整数を入力してください。" };
        }

        const pages = Number(trimmed);
        if (!Number.isInteger(pages) || pages <= 0) {
            return { error: "正の整数を入力してください。" };
        }

        return { pages };
    };

    const createImposition = (totalPages, sheets) => {
        const imposition = [];
        for (let i = 0; i < sheets; i += 1) {
            imposition.push({
                sheet: i + 1,
                frontLeft: totalPages - 2 * i,
                frontRight: 1 + 2 * i,
                backLeft: 2 + 2 * i,
                backRight: totalPages - 1 - 2 * i,
            });
        }
        return imposition;
    };

    const calculate = (pages) => {
        const sheets = Math.ceil(pages / PER_PAGES);
        const blanks = sheets * PER_PAGES - pages;
        const totalPages = sheets * PER_PAGES;
        return {
            pages,
            sheets,
            blanks,
            totalPages,
            imposition: createImposition(totalPages, sheets),
        };
    };

    const formatPage = (page, pages) => (page > pages ? "空白" : String(page));

    const buildSummaryHtml = ({ sheets, blanks, totalPages }) => [
        '<div class="msg res">',
        '<div class="row-items" role="list">',
        `<div class="item" role="listitem"><div class="small">用紙枚数</div><div class="num" title="用紙枚数">${sheets}枚</div></div>`,
        `<div class="item" role="listitem"><div class="small">総ページ数</div><div class="num">${totalPages}ページ</div></div>`,
        `<div class="item" role="listitem"><div class="small">空白ページ</div><div class="num">${blanks}ページ</div></div>`,
        "</div>",
        "</div>",
    ].join("");

    const buildSheetHtml = (sheet, pages) => [
        '<div class="sheet">',
        `<div class="sheet-title">${sheet.sheet}枚目</div>`,
        '<div class="sheet-row">',
        '<div class="sheet-col"><div class="small">表</div>',
        `<div>左：<strong>${formatPage(sheet.frontLeft, pages)}</strong> / 右：<strong>${formatPage(sheet.frontRight, pages)}</strong></div></div>`,
        '<div class="sheet-col"><div class="small">裏</div>',
        `<div>左：<strong>${formatPage(sheet.backLeft, pages)}</strong> / 右：<strong>${formatPage(sheet.backRight, pages)}</strong></div></div>`,
        "</div>",
        "</div>",
    ].join("");

    const buildImpositionHtml = ({ pages, imposition }) =>
        imposition.map((sheet) => buildSheetHtml(sheet, pages)).join("");

    const renderError = (message) => {
        result.innerHTML = `<div class="msg err">${message}</div>`;
    };

    const renderResult = (data) => {
        result.innerHTML = buildSummaryHtml(data) + buildImpositionHtml(data);
    };

    const updateUrl = (value) => {
        const url = new URL(window.location.href);
        url.searchParams.set("pages", value);
        window.history.replaceState({}, "", url.toString());
    };

    const readPagesFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("pages");
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const { pages, error } = parsePages(input.value);
        if (error) {
            renderError(error);
            return;
        }

        updateUrl(String(pages));
        renderResult(calculate(pages));
    });

    document.addEventListener("DOMContentLoaded", () => {
        const raw = readPagesFromUrl();
        if (raw === null) {
            return;
        }

        const { pages, error } = parsePages(raw);
        if (error) {
            renderError(error);
            return;
        }

        input.value = String(pages);
        renderResult(calculate(pages));
    });
})();
