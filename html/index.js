bills = [];
currentBillId = null;
billMenu = false;
invoiceMenu = false;
invoicePlayer = null;
translations = [];
window.addEventListener('message', function(event) {
    ed = event.data;
	if (ed.action === "openMenu") {
		translations = ed.translations;
		document.getElementById("title1").innerHTML=translations.title1;
		document.getElementById("description1").innerHTML=translations.description1;
		document.getElementById("menutitle1").innerHTML=translations.menutitle1;
		document.getElementById("menutitle2").innerHTML=translations.menutitle2;
		document.getElementById("bottomtitle").innerHTML=translations.bottomtitle;
		document.getElementById("billingDivInside2TopRightBtn1").classList.add("billingDivInside2TopRightBtnActive");
		document.getElementById("billingDivInside2TopRightBtn2").classList.remove("billingDivInside2TopRightBtnActive");
		billMenu = true;
        document.getElementById("billingDivInside2BottomBottom").innerHTML="";
        bills = ed.data;
        bills.forEach(function(billData, index) {
            if (billData.paid === false) {
				var billHTML = `
				<div class="mainDivInsideBillDiv" id="mainDivInsideBillDiv-${billData.id}">
					<div id="mainDivInsideBillDivLR-${billData.id}" class="mainDivInsideBillDivLR" style="top: 12%; padding-top: 0.183vw; padding-bottom: 0.183vw;"></div>
					<div id="mainDivInsideBillDivInside" style="align-items: center;">
						<div id="MDIRDIDiv1">
							<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
							<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${billData.type}</span></div>
						</div>
						<div id="MDIRDIDiv1">
							<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${billData.asset}</span></div>
						</div>
						<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${billData.id}')"></div>
					</div>
				</div>`;
				appendHtml(document.getElementById("billingDivInside2BottomBottom"), billHTML);
			}
		});
		$("#billingDiv").show().css({bottom: "-200%"}).animate({bottom: "0%", top: "0%"}, 800, function() {});
	} else if (ed.action === "updateBills") {
		document.getElementById("billingDivInside2BottomBottom").innerHTML="";
        bills = ed.data;
        bills.forEach(function(billData, index) {
            if (billData.paid === false) {
				var billHTML = `
				<div class="mainDivInsideBillDiv" id="mainDivInsideBillDiv-${billData.id}">
					<div id="mainDivInsideBillDivLR-${billData.id}" class="mainDivInsideBillDivLR" style="top: 12%; padding-top: 0.183vw; padding-bottom: 0.183vw;"></div>
					<div id="mainDivInsideBillDivInside" style="align-items: center;">
						<div id="MDIRDIDiv1">
							<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
							<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${billData.type}</span></div>
						</div>
						<div id="MDIRDIDiv1">
							<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${billData.asset}</span></div>
						</div>
						<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${billData.id}')"></div>
					</div>
				</div>`;
				appendHtml(document.getElementById("billingDivInside2BottomBottom"), billHTML);
			}
		});
    } else if (ed.action === "openInvoiceMenu") {
		translations = ed.translations;
		taxRate = ed.taxRate;
		document.getElementById("title2").innerHTML=translations.title2;
		document.getElementById("description2").innerHTML=translations.description2;
		document.getElementById("invoice_title_input").innerHTML=translations.invoice_title_input;
		document.getElementById("billingInputDivInsideInput-Title").placeholder=translations.invoice_title_input_placeholder;
		document.getElementById("invoice_amount_input").innerHTML=translations.invoice_amount_input + ` (Tax rate is %${taxRate})`;
		document.getElementById("invoice_target_player_input").innerHTML=translations.invoice_target_player_input;
		document.getElementById("billingInputDivInsideApproveDiv").innerHTML=translations.approve;
		document.getElementById("billingInputDivInsideInput-Price").max = ed.maxVal;
		invoiceMenu = true;
		$("#billingInputDiv").show().css({bottom: "-200%"}).animate({bottom: "0%", top: "0%"}, 800, function() {});
		document.getElementById("billingInputDivInsideInput-PlayerId").value = ed.text;
		invoicePlayer = ed.target;
	}
	document.onkeyup = function(data) {
		if (data.which == 27 && invoiceMenu) {
            invoiceMenu = false;
			$("#billingInputDiv").show().css({bottom: "0%", top: "0%"}).animate({bottom: "-200%"}, 800, function() {});
			post({action: "nuiFocus"});
		}
		if (data.which == 27 && billMenu) {
            billMenu = false;
			$("#billingDiv").show().css({bottom: "0%", top: "0%"}).animate({bottom: "-200%"}, 800, function() {});
			post({action: "nuiFocus"});
		}
	}
})

function clFunc(name1, name2, name3, name4, name5) {
    if (name1 === "showAllBillInfos") {
		let existingBill = bills.find(item => item.id === Number(name2));
		if (existingBill) {
			if (existingBill.infosShown) {
				currentBillId = null;
				existingBill.infosShown = false;
				let title = existingBill.asset;
				if (title.length > 18) {
					title = title.slice(0, 18) + "...";
				}
				let divlClass = "mainDivInsideBillDivLR";
				if (existingBill.paid) {
					divlClass = "mainDivInsideBillDivLR mainDivInsideBillDivLRGreen";
				}
				document.getElementById(`mainDivInsideBillDiv-${existingBill.id}`).innerHTML=`
				<div id="mainDivInsideBillDivLR-${existingBill.id}" class="${divlClass}" style="top: 12%; padding-top: 0.183vw; padding-bottom: 0.183vw;"></div>
				<div id="mainDivInsideBillDivInside" style="align-items: center;">
					<div id="MDIRDIDiv1">
						<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
						<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${existingBill.type}</span></div>
					</div>
					<div id="MDIRDIDiv1">
						<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${existingBill.asset}</span></div>
					</div>
					<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${existingBill.id}')"></div>
				</div>`;
			} else {
				if (currentBillId) {
					let existingBill2 = bills.find(item => item.id === currentBillId);
					if (existingBill2) {
						existingBill2.infosShown = false;
						// Hide Infos
						let title = existingBill2.asset;
						if (title.length > 18) {
							title = title.slice(0, 18) + "...";
						}
						let divlClass = "mainDivInsideBillDivLR";
						if (existingBill2.paid) {
							divlClass = "mainDivInsideBillDivLR mainDivInsideBillDivLRGreen";
						}
						document.getElementById(`mainDivInsideBillDiv-${existingBill2.id}`).innerHTML=`
						<div id="mainDivInsideBillDivLR-${existingBill2.id}" class="${divlClass}" style="top: 12%; padding-top: 0.183vw; padding-bottom: 0.183vw;"></div>
						<div id="mainDivInsideBillDivInside" style="align-items: center;">
							<div id="MDIRDIDiv1">
								<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
								<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${existingBill2.type}</span></div>
							</div>
							<div id="MDIRDIDiv1">
								<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${existingBill2.asset}</span></div>
							</div>
							<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${existingBill2.id}')"></div>
						</div>`;
					}
				}
				currentBillId = Number(name2);
				existingBill.infosShown = true;
				let asset = existingBill.asset;
				if (asset.length > 18) {
					asset = asset.slice(0, 18) + "...";
				}
				let amountText = "Amount Due";
				let divlClass = "mainDivInsideBillDivLR";
				if (existingBill.paid) {
					divlClass = "mainDivInsideBillDivLR mainDivInsideBillDivLRGreen";
					amountText = "Amount Paid";
					document.getElementById(`mainDivInsideBillDiv-${existingBill.id}`).innerHTML=`
					<div id="mainDivInsideBillDivLR-${existingBill.id}" class="${divlClass}" style="top: 8%; padding-top: 0.18vw; padding-bottom: 0.18vw;"></div>
					<div id="mainDivInsideBillDivInside" style="align-items: center;">
						<div id="MDIRDIDiv1">
							<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
							<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${existingBill.type}</span></div>
						</div>
						<div id="MDIRDIDiv1">
							<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${existingBill.asset}</span></div>
						</div>
						<div id="MDIRDIDiv1Btns">
							<div id="MDIRDIDivBtnType3" style="opacity: 0;"><span>Delete</span></div>
							<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${existingBill.id}')"></div>
						</div>
					</div>
					<div id="mainDivInsideBillDivInside" style="align-items: flex-start;">
						<div id="MDIRDIDiv1" style="padding-top: 0;">
							<div class="MDIRDIDivTextDiv" style="text-transform: none;"><span>${amountText}</span><span>$${existingBill.amount} incl. ${existingBill.taxRate}% tax</span></div>
						</div>
						<div id="MDIRDIDivBtnType2" style="opacity: 0;"><span>${translations.pay_bill}</span></div>
					</div>`;
				} else {
					document.getElementById(`mainDivInsideBillDiv-${existingBill.id}`).innerHTML=`
					<div id="mainDivInsideBillDivLR-${existingBill.id}" class="${divlClass}" style="top: 8%; padding-top: 0.18vw; padding-bottom: 0.18vw;"></div>
					<div id="mainDivInsideBillDivInside" style="align-items: center;">
						<div id="MDIRDIDiv1">
							<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
							<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${existingBill.type}</span></div>
						</div>
						<div id="MDIRDIDiv1">
							<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${existingBill.asset}</span></div>
						</div>
						<div id="MDIRDIDiv1Btns">
							<div id="MDIRDIDivBtnType3" style="opacity: 0;"><span>Delete</span></div>
							<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${existingBill.id}')"></div>
						</div>
					</div>
					<div id="mainDivInsideBillDivInside" style="align-items: flex-start; z-index: 22222222;">
						<div id="MDIRDIDiv1" style="padding-top: 0;">
							<div class="MDIRDIDivTextDiv" style="text-transform: none;"><span>${amountText}</span><span>$${existingBill.amount} incl. ${existingBill.taxRate}% tax</span></div>
						</div>
						<div id="MDIRDIDivBtnType2" onclick="clFunc('payBill', '${existingBill.id}', '${existingBill.amount}', '${existingBill.type}', '${existingBill.owner}')"><span>${translations.pay_bill}</span></div>
					</div>`;
				}
			}
		}
    } else if (name1 === "showOutstandings") {
		document.getElementById("billingDivInside2TopRightBtn1").classList.add("billingDivInside2TopRightBtnActive");
		document.getElementById("billingDivInside2TopRightBtn2").classList.remove("billingDivInside2TopRightBtnActive");
		document.getElementById("billingDivInside2BottomBottom").innerHTML="";
		bills.forEach(function(billData, index) {
            if (billData.paid === false) {
				var billHTML = `
				<div class="mainDivInsideBillDiv" id="mainDivInsideBillDiv-${billData.id}">
					<div id="mainDivInsideBillDivLR-${billData.id}" class="mainDivInsideBillDivLR" style="top: 12%; padding-top: 0.183vw; padding-bottom: 0.183vw;"></div>
					<div id="mainDivInsideBillDivInside" style="align-items: center;">
						<div id="MDIRDIDiv1">
							<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
							<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${billData.type}</span></div>
						</div>
						<div id="MDIRDIDiv1">
							<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${billData.asset}</span></div>
						</div>
						<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${billData.id}')"></div>
					</div>
				</div>`;
				appendHtml(document.getElementById("billingDivInside2BottomBottom"), billHTML);
			}
		});
		if (currentBillId) {
			let existingBill = bills.find(item => item.id === currentBillId);
			if (existingBill) {
				existingBill.infosShown = false;
			}
			currentBillId = null;
		}
	} else if (name1 === "showPaids") {
		document.getElementById("billingDivInside2TopRightBtn1").classList.remove("billingDivInside2TopRightBtnActive");
		document.getElementById("billingDivInside2TopRightBtn2").classList.add("billingDivInside2TopRightBtnActive");
		document.getElementById("billingDivInside2BottomBottom").innerHTML="";
		bills.forEach(function(billData, index) {
			if (billData.paid) {
				var billHTML = `
				<div class="mainDivInsideBillDiv" id="mainDivInsideBillDiv-${billData.id}">
					<div id="mainDivInsideBillDivLR-${billData.id}" class="mainDivInsideBillDivLR mainDivInsideBillDivLRGreen" style="top: 12%; padding-top: 0.183vw; padding-bottom: 0.183vw;"></div>
					<div id="mainDivInsideBillDivInside" style="align-items: center;">
						<div id="MDIRDIDiv1">
							<div id="MDIRDIDivIconDiv"><i class="fas fa-house"></i></div>
							<div class="MDIRDIDivTextDiv"><span>${translations.type}</span><span>${billData.type}</span></div>
						</div>
						<div id="MDIRDIDiv1">
							<div class="MDIRDIDivTextDiv"><span>${translations.asset}</span><span>${billData.asset}</span></div>
						</div>
						<div id="MDIRDIDivBtnType1" onclick="clFunc('showAllBillInfos', '${billData.id}')"></div>
					</div>
				</div>`;
				appendHtml(document.getElementById("billingDivInside2BottomBottom"), billHTML);
			}
		});
		if (currentBillId) {
			let existingBill = bills.find(item => item.id === currentBillId);
			if (existingBill) {
				existingBill.infosShown = false;
			}
			currentBillId = null;
		}
	} else if (name1 === "sendInvoice") {
		let title = document.getElementById("billingInputDivInsideInput-Title");
		if ((title.value == null || title.value == "")) {
			title.focus();
			return;
		}
		let price = document.getElementById("billingInputDivInsideInput-Price");
		if ((price.value == null || price.value == "")) {
			price.focus();
			return;
		}
		post({action: "sendInvoice", target: invoicePlayer, title: title.value, price: Number(price.value)});
		invoiceMenu = false;
		$("#billingInputDiv").show().css({bottom: "0%", top: "0%"}).animate({bottom: "-200%"}, 800, function() {});
		post({action: "nuiFocus"});
	} else if (name1 === "payBill") {
		if (currentBillId) {currentBillId = null};
		let existingBill = bills.find(item => item.id === Number(name2));
		if (existingBill) {existingBill.paid = true};
		post({action: "payBill", id: Number(name2), amount: Number(name3), type: name4, sender: name5});
	}
}

document.getElementById("billingInputDivInsideInput-Title").addEventListener("click", () => {
	document.getElementById("billingInputDivInsideInputDiv1").classList.add("billingInputDivInsideInputDivActive");
	document.getElementById("billingInputDivInsideInputDiv2").classList.remove("billingInputDivInsideInputDivActive");
	document.getElementById("billingInputDivInsideInputDiv3").classList.remove("billingInputDivInsideInputDivActive");
});

document.getElementById("billingInputDivInsideInput-Price").addEventListener("click", () => {
	document.getElementById("billingInputDivInsideInputDiv1").classList.remove("billingInputDivInsideInputDivActive");
	document.getElementById("billingInputDivInsideInputDiv2").classList.add("billingInputDivInsideInputDivActive");
	document.getElementById("billingInputDivInsideInputDiv3").classList.remove("billingInputDivInsideInputDivActive");
});

document.getElementById("billingInputDivInsideInput-PlayerId").addEventListener("click", () => {
	document.getElementById("billingInputDivInsideInputDiv1").classList.remove("billingInputDivInsideInputDivActive");
	document.getElementById("billingInputDivInsideInputDiv2").classList.remove("billingInputDivInsideInputDivActive");
	document.getElementById("billingInputDivInsideInputDiv3").classList.add("billingInputDivInsideInputDivActive");
});

document.getElementById('billingInputDivInsideInput-Title').addEventListener('input', function() {
	if (this.value.length > 20) {
		this.value = this.value.slice(0, 20);
	}
});

document.getElementById('billingInputDivInsideInput-Price').addEventListener('input', function() {
	checkValue(this);
	let addVal = Number(this.value) * taxRate / 100;
	document.getElementById("invoice_amount_input").innerHTML=translations.invoice_amount_input + ` (+$${addVal} Tax)`;
});

function checkValue(sender) {
    let min = sender.min;
    let max = sender.max;
    let value = int(sender.value);
    if (value > max) {
        sender.value = min;
    } else if (value < min) {
        sender.value = max;
    }
}

function int(value) {
    return parseInt(value);
}

function appendHtml(el, str) {
	var div = document.createElement('div');
	div.innerHTML = str;
	while (div.children.length > 0) {
		el.appendChild(div.children[0]);
	}
}

function post(data) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", `https://${GetParentResourceName()}/callback`, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(data));
}