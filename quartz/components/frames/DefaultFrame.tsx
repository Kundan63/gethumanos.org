import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"

const Header = HeaderConstructor()

/**
 * The default page frame — three-column layout with left sidebar, center
 * content (header + body + afterBody), and right sidebar, followed by a footer.
 *
 * This is the original Quartz layout, extracted from renderPage.tsx.
 */
export const DefaultFrame: PageFrame = {
  name: "default",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer,
  }: PageFrameProps) {
    return (
      <>
        <div class="left sidebar">
          {left.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <div class="center">
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <script
              // Small header behaviors that don't need a full plugin:
              // 1) the "Explorer" toggle expands/collapses the horizontal
              //    domain-nav strip in place (click to open, click again to
              //    close) — 12 full domain names don't all fit on most
              //    screens, so it pans sideways rather than wrapping.
              // 2) moving the cursor left/right across the open strip pans
              //    it to match — cursor near the left edge shows the first
              //    domains, cursor near the right edge reveals the last
              //    ones (those first domains scroll out to the left as it
              //    does), like a hover-scrub filmstrip instead of a
              //    traditional scrollbar-drag.
              // 3) a normal (vertical) mouse-wheel scroll over the strip
              //    still pans it sideways too, for anyone who scrolls
              //    instead of hovering across it.
              // 4) the graph-view button proxies a click to the existing
              //    (now-hidden) global-graph icon, opening the same
              //    all-notes graph — CSS makes it fill the whole screen
              //    instead of a small centered modal (see custom.scss),
              //    and this injects a visible × close button into it
              //    (closing dispatches a real Escape keypress so the
              //    graph plugin's own cleanup/animation-stop logic runs).
              dangerouslySetInnerHTML={{
                __html: `(function(){if(window.__humanosHeaderWired)return;window.__humanosHeaderWired=true;document.addEventListener("click",function(e){var toggle=e.target&&e.target.closest?e.target.closest(".domain-toggle"):null;if(toggle){var nav=document.querySelector(".domain-nav");if(nav){var open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",open?"true":"false");}return;}var gh=e.target&&e.target.closest?e.target.closest(".graph > h3"):null;if(gh){var g=gh.closest(".graph");if(g)g.classList.toggle("expanded");return;}var cb=e.target&&e.target.closest?e.target.closest(".humanos-graph-close"):null;if(cb){document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}));return;}var dm=e.target&&e.target.closest?e.target.closest(".darkmode"):null;if(dm){var theme=document.documentElement.getAttribute("saved-theme");dm.setAttribute("data-tooltip",theme==="dark"?"Light mode":"Dark mode");}var ft=e.target&&e.target.closest?e.target.closest(".feedback-trigger"):null;if(ft){openFeedbackModal();return;}var fc=e.target&&e.target.closest?e.target.closest(".feedback-modal-close"):null;if(fc){closeFeedbackModal();return;}if(e.target&&e.target.classList&&e.target.classList.contains("feedback-modal-backdrop")){closeFeedbackModal();return;}});document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;var backdrop=document.getElementById("feedback-modal-backdrop");if(backdrop&&backdrop.classList.contains("open"))closeFeedbackModal();});document.addEventListener("submit",function(e){if(!e.target||e.target.id!=="feedback-form")return;e.preventDefault();submitFeedback(e.target);});function openFeedbackModal(){var backdrop=document.getElementById("feedback-modal-backdrop");if(!backdrop)return;backdrop.classList.add("open");backdrop.setAttribute("aria-hidden","false");var first=backdrop.querySelector('input[type="radio"]');if(first)first.focus();}function closeFeedbackModal(){var backdrop=document.getElementById("feedback-modal-backdrop");if(!backdrop)return;backdrop.classList.remove("open");backdrop.setAttribute("aria-hidden","true");}function submitFeedback(form){var status=document.getElementById("feedback-status");var category=form.querySelector('input[name="feedback-category"]:checked');var message=form.querySelector("#feedback-message");var email=form.querySelector("#feedback-email");var website=form.querySelector(".feedback-honeypot");var submitBtn=form.querySelector(".feedback-submit");if(!category){if(status){status.textContent="Please choose a feedback type.";status.className="feedback-status feedback-status-error";}return;}if(!message||message.value.trim().length<3){if(status){status.textContent="Please write a bit more detail.";status.className="feedback-status feedback-status-error";}return;}if(submitBtn)submitBtn.disabled=true;if(status){status.textContent="Sending...";status.className="feedback-status";}fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({category:category.value,message:message.value,email:email?email.value:"",website:website?website.value:"",pageUrl:window.location.href})}).then(function(res){return res.json().then(function(data){return{ok:res.ok,data:data};});}).then(function(result){if(submitBtn)submitBtn.disabled=false;if(result.ok){if(status){status.textContent="Thanks \u2014 feedback sent.";status.className="feedback-status feedback-status-success";}form.reset();setTimeout(closeFeedbackModal,1400);}else{if(status){status.textContent=(result.data&&result.data.error)||"Something went wrong.";status.className="feedback-status feedback-status-error";}}}).catch(function(){if(submitBtn)submitBtn.disabled=false;if(status){status.textContent="Network error \u2014 please try again.";status.className="feedback-status feedback-status-error";}});}document.addEventListener("wheel",function(e){var nav=e.target&&e.target.closest?e.target.closest(".domain-nav.open"):null;if(!nav)return;if(nav.scrollWidth<=nav.clientWidth)return;if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){nav.scrollLeft+=e.deltaY;e.preventDefault();}},{passive:false});var panRaf=null;document.addEventListener("mousemove",function(e){var nav=e.target&&e.target.closest?e.target.closest(".domain-nav.open"):null;if(!nav)return;var clientX=e.clientX;if(panRaf)cancelAnimationFrame(panRaf);panRaf=requestAnimationFrame(function(){panRaf=null;var max=nav.scrollWidth-nav.clientWidth;if(max<=0)return;var rect=nav.getBoundingClientRect();var ratio=(clientX-rect.left)/rect.width;if(ratio<0)ratio=0;if(ratio>1)ratio=1;nav.scrollLeft=ratio*max;});});function injectGraphClose(){document.querySelectorAll(".global-graph-outer").forEach(function(outer){if(outer.querySelector(".humanos-graph-close"))return;var btn=document.createElement("button");btn.type="button";btn.className="humanos-graph-close";btn.setAttribute("aria-label","Close graph view");btn.textContent="\u00d7";outer.appendChild(btn);});}function moveGraphIcon(){var icon=document.querySelector(".graph .global-graph-icon");var slot=document.querySelector(".graph-view-trigger-slot");if(icon&&slot&&icon.parentElement!==slot){icon.classList.add("graph-view-trigger");slot.replaceWith(icon);}}function stampTooltips(){var s=document.querySelector(".header-utilities .search-button");if(s)s.setAttribute("data-tooltip","Search");var r=document.querySelector(".header-utilities .readermode");if(r)r.setAttribute("data-tooltip","Reader mode");var g=document.querySelector(".header-utilities .graph-view-trigger");if(g)g.setAttribute("data-tooltip","Graph view");var d=document.querySelector(".header-utilities .darkmode");if(d){var theme=document.documentElement.getAttribute("saved-theme");d.setAttribute("data-tooltip",theme==="dark"?"Light mode":"Dark mode");}}function syncGraphContrast(){if(document.querySelector(".graph-container")){document.documentElement.setAttribute("data-graph-visible","true");}else{document.documentElement.removeAttribute("data-graph-visible");}}document.addEventListener("nav",injectGraphClose);document.addEventListener("nav",moveGraphIcon);document.addEventListener("nav",stampTooltips);document.addEventListener("nav",syncGraphContrast);document.addEventListener("nav",closeFeedbackModal);injectGraphClose();moveGraphIcon();stampTooltips();syncGraphContrast();})();`,
              }}
            />
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </div>
        <div class="right sidebar">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}
      </>
    )
  },
}
