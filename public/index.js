//jshint esversion:6

// navigation bar
const navSlide = () => {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav_links");
    const navLinks = document.querySelectorAll(".nav_links li");


    
    burger.addEventListener("click", () => {

        // toggle nav
        nav.classList.toggle("nav_active");

         // animate links
        navLinks.forEach((link, index)=>{
        // + 0.3 for initial delay
        if(link.style.animation){
            link.style.animation ="";
        }else{
            link.style.animation =`navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s `;

        }
        });

        // animate burger
        burger.classList.toggle("toggle");

    });

   

};

// invoke function
navSlide();



// scroll EVENT
window.addEventListener("scroll", function(){
    let nav = document.querySelector(".navigation");
    let windowPosition = window.scrollY > 0;
    nav.classList.toggle("scrolling-active", windowPosition);
});


// footer

const currentYear = new Date().getFullYear();
const copyrightYear = document.querySelector(".year");
copyrightYear.innerHTML = currentYear;


// email form using jquery

$(".footer-form").on("submit", (e)=>{
    e.preventDefault();
    const email = $("#email").val().trim();
    const subject = $("#subject").val().trim();
    const text = $("#message").val().trim();

    let data = {
        email,
        subject,
        text
    };

    $.post("/email", data, function(){
        console.log("server received our data");
    });

});


