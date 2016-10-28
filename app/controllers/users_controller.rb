class UsersController < ApplicationController
  def create
    user = User.new(user_params)
    if user.save
      session[:user_id] = user.id
      redirect_to "/dashboard/#{session[:user_id]}"
    else 
      flash[:errors] = user.errors.full_messages
      redirect_to :back
    end
  end
  def subscribe
    TimelineUser.create(timeline_users_params)
    redirect_to :back, notice: "You have successfully subscribed to this timeline"
  end
  def login_reg 
    render partial: "shared/loginreg"
  end   
  private
  def user_params
  	params.require(:user).permit(:first_name, :last_name, :username, :email, :password, :password_confirmation)
  end
  def timeline_users_params
    params.require(:timeline_users).permit(:user_id, :timeline_id)
  end
end

