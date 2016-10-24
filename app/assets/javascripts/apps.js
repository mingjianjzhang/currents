$(document).ready(function(){
	$(".button-collapse").sideNav({
		menuWidth: 250
	});
	$('select').material_select();
	$('.date').datepicker({
		dateFormat: "yy-mm-dd",
		changeMonth: true,
		changeYear: true,
		yearRange: "1950:2020"

	}); 
	$(document).tooltip();

	$('.contentCategory').change(function(){
		$('.linkInputs').show();
		if($(this).val() == 1) {
			$('label[for=link]').text("Link");
			$('.notBook').show();
		} else if ($(this).val() == 2) {
			$('label[for=link]').text("Embed code(iframe)");
			$('.notBook').show();
		} else if ($(this).val() == 4) {
			$('label[for=link]').text("ISBN");
			$('.notBook').hide();
		}
	})

	$('#thisMonthA').click(function(e){
		$.post($('#thisMonthly').attr('action'), $('#thisMonthly').serialize(), function(res) {
			$('#timelineDisplay').html(res);
		})
		e.preventDefault();
	})
	$('#lastSixA').click(function(e){
		e.preventDefault();
		$.post($('#lastSix').attr('action'), $('#lastSix').serialize(), function(res) {
			$('#timelineDisplay').html(res);
			// console.log(res);
		})
	})	
	$('#lastTwoYearsA').click(function(e){
		e.preventDefault();
		$.post($('#lastTwoYears').attr('action'), $('#lastTwoYears').serialize(), function(res) {
			$('#timelineDisplay').html(res);
			// console.log(res);
		})
	})	
	$('#fromBeginningA').click(function(e){
		e.preventDefault();
		$.post($('#fromBeginning').attr('action'), $('#fromBeginning').serialize(), function(res) {
			$('#timelineDisplay').html(res);
		})
	})	
	$('.keywordSearch').click(function(e){
		e.preventDefault();
		$.post($(this).attr('action'), { "scope": $(this).attr("keyword") }, function(res) {
			$('#timelineDisplay').html(res);
		})
	})
	$('#dateRange').submit(function(){
		$.post($(this).attr("action"), $(this).serialize(), function(res){
			$('#timelineDisplay').html(res);
		})
		return false;
	})
	// Modal For Adding New Sources/Tags
	$('.addMod').click(function(){
		if ($(this).attr('action') == "/sources") { 
			$('.addSource').show();
			$('.addTag').hide();
		} else {
			$('.addSource').hide();
			$('.addTag').show();			
		}
		$('#addModal').openModal();
	})
})