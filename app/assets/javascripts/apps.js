$(document).ready(function(){

	$.post($('#fromBeginning').attr('action'), $('#fromBeginning').serialize(), function(res) {
		$('#timelineDisplay').html(res);
	})
	$('#goBut').attr("href", "timeline/2");
	$(".button-collapse").sideNav({
		menuWidth: 180
	});


	$('#searchSelect').select2({
	});
	$('.propSelect').select2({

	})
	$('#logic').material_select();

	$('#searchSelect').change(function(){
		$('#goBut').attr("href", "timeline/"+$(this).val());
	})


	// $('select').material_select();
	$('.date').datepicker({
		dateFormat: "yy-mm-dd",
		changeMonth: true,
		changeYear: true,
		yearRange: "1950:2020"

	}); 


	$('#thisMonthA').click(function(e){
		$.post($('#thisMonthly').attr('action'), $('#thisMonthly').serialize(), function(res) {
			$('#timelineDisplay').html(res);
			$('#queryParameters').text($('#thisMonthA').text())
		})
		e.preventDefault();
	})
	$('#lastSixA').click(function(e){
		e.preventDefault();
		$.post($('#lastSix').attr('action'), $('#lastSix').serialize(), function(res) {
			$('#timelineDisplay').html(res);
			$('#queryParameters').text($('#lastSixA').text())
		})
	})	
	$('#lastTwoYearsA').click(function(e){
		e.preventDefault();
		$.post($('#lastTwoYears').attr('action'), $('#lastTwoYears').serialize(), function(res) {
			$('#timelineDisplay').html(res);
			$('#queryParameters').text($('#lastTwoYearsA').text())
		})
	})	
	$('#fromBeginningA').click(function(e){
		e.preventDefault();
		$.post($('#fromBeginning').attr('action'), $('#fromBeginning').serialize(), function(res) {
			$('#timelineDisplay').html(res);
			$('#queryParameters').text($('#fromBeginningA').text())
		})
	})	
	$('#keywordSearch').submit(function(){

		$.post($(this).attr('action'), $(this).serialize(), function(res) {
			if (res == "Sorry, there were no matches for your search") {
				$('#queryParameters').html(res);
			} else {
				$('#timelineDisplay').html(res);
			}
		})
		return false;
	})
	$('#dateRange').submit(function(){
		$.post($(this).attr("action"), $(this).serialize(), function(res){
			$('#timelineDisplay').html(res);
			$('#queryParameters').html("From <strong>" + $('#beginDate').val() + "</strong> to  <strong>" + $('#endDate').val() + "</strong>"); 
		})
		return false;
	})
	// $('.contentCategory').change(function(){
	// 	$('.linkInputs').show();
	// 	if($(this).val() == 1) {
	// 		$('label[for=link]').text("Link");
	// 		$('.notBook').show();
	// 	} else if ($(this).val() == 2) {
	// 		$('label[for=link]').text("Embed code(iframe)");
	// 		$('.notBook').show();
	// 	} else if ($(this).val() == 4) {
	// 		$('label[for=link]').text("ISBN");
	// 		$('.notBook').hide();
	// 	}
	// })


	// $('.addSource').submit(function(){
	// 	$.post($(this).attr("action"), $(this).serialize(), function(res){
	// 		$('#sourceList').html(res);
	// 		$('#sourceMsg').text("You've successfully added a source!");
	// 	})
	// 	return false;
	// })
	// $('.addTag').submit(function(){
	// 	$.post($(this).attr("action"), $(this).serialize(), function(res) {
	// 		$('#tagList').html(res);
	// 		$('#tagMsg').html("You've successfully added a tag!")
	// 	})
	// 	return false;
	// })
	// $('.addImg').submit(function(){
	// 	$.post($(this).attr("action"), $(this).serialize(), function(res) {
	// 		//NEED TO WRITE THIS FUNCTION THAT UPDATES THE INPUT FIELD
	// 		$('#imgMsg').html("You've successfully added a tag!")
	// 	})
	// 	return false;
	// })
	// Modal For Adding New Sources/Tags
	// $('.addMod').click(function(){
	// 	if ($(this).attr('action') == "source") { 
	// 		$('.addSource').show();
	// 		$('.addTag').hide();
	// 		$('.addImage').hide();
	// 	} else if ($(this).attr('action') == "image") {
	// 		$('.addSource').hide();
	// 		$('.addTag').hide();	
	// 		$('.addImage').show();		
	// 	} else if ($(this).attr('action') == "tag") {
	// 		$('.addSource').hide();
	// 		$('.addTag').show();	
	// 		$('.addImage').hide();
	// 	}
	// })
	// Modal for login/reg
	$('.regMod').click(function(){
		$.get("/loginreg", function(res){
			$(".modal-content").html(res);
		})
		if ($(this).attr('action') == 'login') {
			$('#regForm').hide();
			$('#loginForm').show();
		} else {
			$('#loginForm').hide();
			$('#regForm').show();
		}
		$('.modal').openModal();
	})

	$('.addContentMod').click(function(){
		$('.modal').openModal();
		if ($(this).attr("function") == "messages") {
			$.post($(this).attr('location'), function(res){
				$('#modalContents').html(res);
			})
		} else if ($(this).attr("function") == "add_content") {
			$.get($(this).attr('location'), function(res){
				$('#modalContents').html(res);
			})
		}
	})

	// Creating Content
	// $('.createContent').click(function(){
	// 	$.post($('#creatingContent').attr("action"), $('#creatingContent').serialize(), function(res) {
	// 		$('#contentCreationForm').html(res);
	// 		$('.contentCategory').material_select();
	// 	})
	// })

	$('.previewTimeline').click(function(){
		timelineID = $(this).attr('timeline');
		timelineTitle = $(this).text();
		$.post("/display_timeline/"+timelineID, { "scope": "2" }, function(res){
			$('#timelinePreview').html(res)
			$('#timelineNav').attr("href", "/timeline/"+timelineID);
			$('#timelineNav').show();
			$('#timelineLabel').text(timelineTitle);

		})
	})


})