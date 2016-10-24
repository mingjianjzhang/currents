class TimelineAdmin < ActiveRecord::Base
  belongs_to :timeline
  belongs_to :admin

  def self.add_admin user_id, timeline_id
  	#if they are already an admin, add them to the timeline_admin. If not, make them an admin"
  	admin = Admin.find_by(user_id: user_id)
  	if admin
      self.create(admin_id: admin.id, timeline_id: timeline_id)
    else
      admin = Admin.create(user_id: user_id)
      self.create(admin_id: admin.id, timeline_id: timeline_id)
    end
  end
end
 