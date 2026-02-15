// Define the functions first
const randomColorSet = () => {
    const sets = [
        ['#45CCFF', '#49E83E', '#FFD432', '#E84B30', '#B243FF'],
        ['#FF6138', '#FFFF9D', '#BEEB9F', '#79BD8F', '#79BD8F'],
        ['#FCFFF5', '#D1DBBD', '#91AA9D', '#3E606F', '#193441'],
        ['#004358', '#1F8A70', '#BEDB39', '#FFE11A', '#FD7400'],
        ['#105B63', '#FFFAD5', '#FFD34E', '#DB9E36', '#BD4932']
    ];
    return sets[Math.floor(Math.random() * sets.length)];
};

const colorSet = randomColorSet();
const mode = Math.floor(Math.random() * 2);

const randomColor = () => colorSet[Math.floor(Math.random() * colorSet.length)];

// Export a single function that application.js will call
export default function initPostStyling() {
    console.log("Initializing Post Styling...");

    $(document).on('turbo:load', function() {
        console.log("Turbo loaded - applying colors. Mode:", mode);

        if ($(".single-post-card").length) {
            $(".single-post-card").each(function() {
                if (mode == 1) {
                    $(this).addClass("solid-color-mode");
                    $(this).css('background-color', randomColor());
                } else {
                    $(this).addClass("border-color-mode");
                    $(this).css('border', '5px solid ' + randomColor());
                }
            });
        }
    });
}