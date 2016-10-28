class TimelineAdmin < ActiveRecord::Base
  belongs_to :timeline
  belongs_to :admin

  def self.add_admin user_id, timeline_id, status
  	#if they are already an admin, add them to the timeline_admin. If not, make them an admin"
  	admin = Admin.find_by(user_id: user_id)
  	if admin
      self.create(admin_id: admin.id, timeline_id: timeline_id, status: status)
    else
      admin = Admin.create(user_id: user_id)
      self.create(admin_id: admin.id, timeline_id: timeline_id, status: status)
    end
    if TimelineUser.where(timeline_id: timeline_id).first 
      TimelineUser.where(user_id: user_id, timeline_id: timeline_id).first.destroy
    end
  end
end
 